export default function (params) {

  const geoJSON = new ol.format.GeoJSON();

  let feature;

  // Parse geometry from string value if not provided.
  params.geometry ??= typeof params.value === 'string' ? JSON.parse(params.value) : params.value

  // Create OL style object from params.style if not provided.
  params.Style ??= mapp.utils.style(params.style)

  try {

    feature = params.geometry && geoJSON.readFeature({
      type: 'Feature',
      geometry: params.geometry
    }, {
      dataProjection: `EPSG:${params.dataProjection || params.srid || this.srid}`,
      featureProjection: `EPSG:${this.srid}`
    });

  } catch (err) {

    console.error(err)
    return;
  }

  if (!feature) return;

  const layerVector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature]
    }),
    zIndex: params.zIndex,
    style: params.Style
  })

  this.Map.addLayer(layerVector)

  return layerVector
}