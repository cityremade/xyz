export default _xyz => params => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest();

  const bounds = params.viewport && _xyz.mapview && _xyz.mapview.getBounds();

  const center = params.center && _xyz.mapview && ol.proj.transform(
    _xyz.map.getView().getCenter(),
    'EPSG:' + _xyz.mapview.srid,
    'EPSG:4326');

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString(
      Object.assign({
      locale: _xyz.locale.key,
      layer: params.layer && params.layer.key,
      dbs: params.dbs,
      id: params.id,
      template: encodeURIComponent(params.query),
      lat: center && center[1],
      lng: center && center[0],
      filter: params.layer && params.layer.filter && JSON.stringify(params.layer.filter.current),
      viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _xyz.mapview.srid]
    }, params.queryparams || {})));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status });

    resolve(e.target.response);

  }

  xhr.send();

})