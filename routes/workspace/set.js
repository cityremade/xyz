// Save workspace provided in post body to the Postgres table.
module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/workspace/set',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_workspace: true
      })
    ]),
    handler: async (req, res) => {
      
      // Check workspace.
      const workspace = await require(global.appRoot + '/mod/checkWorkspace')(JSON.parse(req.body.settings));
      
      // Save checked workspace to PostgreSQL table.
      if (global.pg.ws_save) await global.pg.ws_save(workspace);
         
      // Return checked workspace to sender.
      res.code(200).send(workspace);
        
    }
  });
};