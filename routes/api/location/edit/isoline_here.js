module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/edit/isoline/here',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        public: global.public
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          locale: { type: 'string' },
          layer: { type: 'string' },
          table: { type: 'string' },
          coordinates: { type: 'string' },
        },
        required: ['locale', 'layer', 'table', 'coordinates']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table;

      const params = {
        coordinates: req.query.coordinates,
        mode: req.query.mode || 'car',
        type: req.query.type || 'fastest', //'shortest'
        rangetype: req.query.rangetype || 'time',
        traffic: 'traffic:disabled'
      };

      params.range = params.rangetype === 'time' ?
        req.query.minutes * 60 || 600 :
        params.rangetype === 'distance' ?
          req.query.distance * 1000 || 1000 :
          600;

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
        return res.code(406).send(new Error('Invalid parameter.'));
      }

      var q = `https://isoline.route.api.here.com/routing/7.2/calculateisoline.json?${global.KEYS.HERE}&mode=${params.type};${params.mode};${params.traffic}&start=geo!${params.coordinates}&range=${params.range}&rangetype=${params.rangetype}`;

      // console.log(q);

      // Fetch results from Google maps places API.
      const here_isolines = await require(global.appRoot + '/mod/fetch')(q);

      if (!here_isolines.response
        || !here_isolines.response.isoline
        || !here_isolines.response.isoline[0].component) return res.code(202).send('No isoline found within this range.');

      const _geojson = {
        'type': 'Polygon',
        'coordinates': [[]]
      };

      here_isolines.response
        .isoline[0].component[0].shape.forEach(el => {
          el = el.split(',');
          _geojson.coordinates[0].push(el.reverse());
        });

      const geojson = JSON.stringify(_geojson);

      if (req.query.id) {

        // Check whether string params are found in the settings to prevent SQL injections.
        if ([req.query.field]
          .some(val => (typeof val === 'string'
          && global.workspace.lookupValues.indexOf(val) < 0))) {
          return res.code(406).send(new Error('Invalid parameter.'));
        }


        var q = `
          UPDATE ${table}
          SET ${req.query.field} = ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)
          WHERE ${layer.qID} = $1;`;

        var rows = await global.pg.dbs[layer.dbs](q, [req.query.id]);

        if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');

        // Query field for updated infoj
        const infoj = JSON.parse(JSON.stringify(layer.infoj));

        // The fields array stores all fields to be queried for the location info.
        fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, layer.qID);

        var q = `
          SELECT ${fields.join()}
          FROM ${table}
          WHERE ${layer.qID} = $1;`;

        var rows = await global.pg.dbs[layer.dbs](q, [req.query.id]);

        if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

        // Iterate through infoj entries and assign values returned from query.
        infoj.forEach(entry => {
          if (rows[0][entry.field]) entry.value = rows[0][entry.field];
        });

        // Send the infoj object with values back to the client.
        return res.code(200).send(infoj);

      }

      const geom = layer.geom ?
        `ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326)` :
        `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${geojson}'), 4326), 3857)`;

      var q = `
        INSERT INTO ${table} (${layer.geom || layer.geom_3857})
        SELECT ${geom}
        RETURNING ${layer.qID} AS id;`;

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      if (layer.mvt_cache) await require(global.appRoot + '/mod/mvt_cache')(layer, table, rows[0].id);

      res.code(200).send(rows[0].id.toString());

    }

  });
};