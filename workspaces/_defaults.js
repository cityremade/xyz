module.exports = {
  workspace: {
    title: 'GEOLYTIX | XYZ',
    locales: {
      zero: {},
    },
  },
  locale: {
    minZoom: 0,
    maxZoom: 20,
    bounds: {
      north: 90,
      east: 180,
      south: -90,
      west: -180
    },
    view: {},
    layers: {
      OSM: {
        display: true,
        format: 'tiles',
        URI: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      },
    },
  },
  layers: {
    tiles: {},
    geojson: {
      srid: '4326',
      style: {
        default: {
          weight: 1,
          color: '#333333',
          fill: true,
          fillColor: '#333333',
          fillOpacity: 0.1,
        },
        highlight: {
          stroke: true,
          color: '#009900',
          weight: 2,
          fillColor: '#ccff99',
          fillOpacity: 0.2,
          fill: true,
        },
        themes: {},
      },
      filter: {},
    },
    mvt: {
      srid: '3857',
      style: {
        default: {
          weight: 1,
          color: '#333333',
          fill: true,
          fillColor: '#333333',
          fillOpacity: 0.1,
        },
        highlight: {
          weight: 2,
          color: '#009900',
          fill: true,
          fillColor: '#ccff99',
          fillOpacity: 0.2,
        },
        themes: {},
      },
      filter: {},
    },
    cluster: {
      srid: '4326',
      style: {
        markerMin: 20,
        markerMax: 40,
        anchor: null,
        marker: {
          type: 'target',
          fillColor: '#999999',
        },
        markerMulti: {
          type: 'target',
          fillColor: '#333333',
        },
        highlight: {
          type: 'target',
          fillColor: '#ccff99'
        },
        themes: {},
      },
      filter: {},
    },
    grid: {
      srid: '4326',
      style: {
        range: [
          '#15773f',
          '#66bd63',
          '#a6d96a',
          '#d9ef8b',
          '#fdae61',
          '#f46d43',
          '#d73027',
        ],
      },
    },
  },
};