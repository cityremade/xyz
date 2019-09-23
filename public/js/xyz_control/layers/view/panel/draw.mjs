export default (_xyz, layer) => {

  if (!layer.edit) return;

  if(layer.edit.properties && Object.keys(layer.edit).length === 1) return;

  if(layer.edit.properties && layer.edit.delete && Object.keys(layer.edit).length === 2) return;


  // Create cluster panel and add to layer dashboard.
  layer.edit.panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(layer.edit.panel);
    

  // Drawing panel header.
  const header = _xyz.utils.wire()`
    <div onclick=${e => {
    e.stopPropagation();
    _xyz.utils.toggleExpanderParent({
      expandable: layer.edit.panel,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews,
    });
  }}
    class="btn_text cursor noselect">Add new features`;
    
  layer.edit.panel.appendChild(header);


  layer.edit.point && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();
   
    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Point',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Point`);
  

  layer.edit.polygon && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Polygon',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Polygon`);
  

  layer.edit.rectangle && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Circle',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      geometryFunction: _xyz.mapview.lib.draw.createBox(),
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Rectangle`);
  

  layer.edit.circle && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Circle',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Circle`);


  layer.edit.line && layer.edit.panel.appendChild(_xyz.utils.wire()`
  <div onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();

    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'LineString',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });

  }}
  class="btn_state btn_wide cursor noselect">Line`);

 
  if(layer.edit.isoline_mapbox){

    if (typeof(layer.edit.isoline_mapbox) !== 'object') layer.edit.isoline_mapbox = {};   

    let block = _xyz.utils.wire()`<div class="block">`;

    layer.edit.panel.appendChild(block);

    _xyz.ctrl.isoline_mapbox({
      entry: layer,
      container: block
    });

    layer.edit.panel.appendChild(_xyz.utils.wire()`
    <div onclick=${e => {
  
    e.stopPropagation();
    const btn = e.target;
  
    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();
  
    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Point',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      // drawend: e=> {},
      geometryFunction: function(coordinates, geometry) {

        geometry = new _xyz.mapview.lib.geom.Circle(coordinates, layer.edit.isoline_mapbox.minutes * 1000);
        
        var feature = new _xyz.mapview.lib.Feature({
          geometry: geometry
        });

        console.log(feature);

        const origin = _xyz.mapview.lib.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');

        const xhr = new XMLHttpRequest();
  
        xhr.open(
          'GET',
          _xyz.host +
          '/api/location/edit/isoline/mapbox?' +
          _xyz.utils.paramString({
            locale: _xyz.workspace.locale.key,
            coordinates: origin.join(','),
            minutes: layer.edit.isoline_mapbox.minutes,
            profile: layer.edit.isoline_mapbox.profile,
            token: _xyz.token
          }));

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
    
        xhr.onload = e => {
        
          if (e.target.status !== 200) return alert('No route found. Try a longer travel time');

          const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

          const feature = geoJSON.readFeature({
            type: 'Feature',
            geometry: e.target.response
          },{ 
            dataProjection: 'EPSG:4326',
            featureProjection:'EPSG:' + _xyz.mapview.srid
          });

          _xyz.mapview.draw.sourceVector.clear();

          _xyz.mapview.draw.sourceVector.addFeature(feature);
                                    
        };
    
        xhr.send();

        return geometry;
      },
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });
  
  }}
    class="btn_state btn_wide cursor noselect">Isoline Mapbox`);

  }


  if(layer.edit.isoline_here){

    if (typeof(layer.edit.isoline_here) !== 'object') layer.edit.isoline_here = {};   

    let block = _xyz.utils.wire()`<div class="block">`;

    layer.edit.panel.appendChild(block);

    _xyz.ctrl.isoline_here({
      entry: layer,
      container: block
    });

    layer.edit.panel.appendChild(_xyz.utils.wire()`
    <div onclick=${e => {
  
    e.stopPropagation();
    const btn = e.target;
  
    if (btn.classList.contains('active')) return _xyz.mapview.draw.finish();
  
    _xyz.mapview.draw.begin({
      layer: layer,
      type: 'Point',
      begin: ()=>{
        btn.classList.add('active');
        layer.view.header.classList.add('edited');
      },
      // drawend: e=> {},
      geometryFunction: function(coordinates, geometry) {

        geometry = new _xyz.mapview.lib.geom.Circle(coordinates, layer.edit.isoline_mapbox.minutes * 1000);
        
        var feature = new _xyz.mapview.lib.Feature({
          geometry: geometry
        });

        const origin = _xyz.mapview.lib.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');

        const xhr = new XMLHttpRequest();
  
        xhr.open(
          'GET',
          _xyz.host +
          '/api/location/edit/isoline/here?' +
          _xyz.utils.paramString({
            locale: _xyz.workspace.locale.key,
            coordinates: origin.join(','),
            mode: layer.edit.isoline_here.mode,
            type: layer.edit.isoline_here.type,
            rangetype: layer.edit.isoline_here.rangetype,
            minutes: layer.edit.isoline_here.minutes,
            distance: layer.edit.isoline_here.distance,
            token: _xyz.token
          }));

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
    
        xhr.onload = e => {
        
          if (e.target.status !== 200) return alert('No route found. Try a longer travel time');

          const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

          const feature = geoJSON.readFeature({
            type: 'Feature',
            geometry: e.target.response
          },{ 
            dataProjection: 'EPSG:4326',
            featureProjection:'EPSG:' + _xyz.mapview.srid
          });

          _xyz.mapview.draw.sourceVector.clear();

          _xyz.mapview.draw.sourceVector.addFeature(feature);
                                    
        };
    
        xhr.send();

        return geometry;
      },
      callback: () => {
        layer.view.header.classList.remove('edited');
        btn.classList.remove('active');
      }
    });
  
  }}
    class="btn_state btn_wide cursor noselect">Isoline Here`);

  }

};