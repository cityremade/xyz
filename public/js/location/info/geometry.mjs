import catchment from './catchment.mjs';

export default (_xyz, record, entry) => {

  if (entry.edit.catchment) catchment(_xyz, record, entry);

  if (!entry.value) return;

  const style = entry.style || {
    stroke: true,
    color: record.color,
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };

  entry.edit.catchment.geometry = _xyz.L.geoJson(
    {
      type: 'Feature',
      geometry: JSON.parse(entry.value)
    }, {
      interactive: false,
      pane: 'select_display',
      style: style
    }).addTo(_xyz.map);

  record.location.geometries.push(entry.edit.catchment.geometry);

};