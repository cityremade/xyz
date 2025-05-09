/**
### mapp.layer.formats.maplibre()

@module /layer/formats/maplibre
*/

// Assign maplibre from window if already loaded.
let promise,
  maplibregl = window.maplibregl;

async function MaplibreGL() {
  if (maplibregl) return new maplibregl.Map(...arguments);

  // Create promise to load maplibre from esm.sh
  if (!promise)
    promise = new Promise((resolve) => {
      import('https://esm.sh/maplibre-gl@4.7.1').then((mod) => {
        maplibregl = mod.default;

        // Avoid loading RTL Text Plugin twice, else it will error
        if (
          !['deferred', 'loaded'].includes(maplibregl.getRTLTextPluginStatus())
        ) {
          maplibregl.setRTLTextPlugin(
            'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
            true, // Lazy load the plugin
          );
        }
        resolve();
      });
    });

  await promise;

  if (!maplibregl) return;

  return new maplibregl.Map(...arguments);
}

export default async (layer) => {
  const className = `mapp-layer-${layer.key} maplibre`;

  layer.container = mapp.utils.html.node`<div 
    class=${className}
    style="visibility: hidden; position: absolute; width: 100%; height: 100%;">`;

  layer.mapview.Map.getTargetElement().prepend(layer.container);

  // Check mapbox style URL and accessToken
  if (layer.style?.URL && layer.accessToken) {
    const testUrl = normalizeStyleURL(layer.style.URL, layer.accessToken);

    layer.style.object = await mapp.utils.xhr(testUrl);

    // The format method must return without creating a layer or even importing the maplibre library if it is not possible to retrieve a mapbox style object.
    if (layer.style.object instanceof Error) {
      return;
    }
  }

  // A layer style object is required to render vector tiles.
  if (!layer.style?.object) {
    console.warn(
      `${layer.key} failed to load, check that an access token and a style.URL are provided.`,
    );
    return;
  }

  const maplibreMap = await MaplibreGL({
    attributionControl: false,
    boxZoom: false,
    container: layer.container,
    doubleClickZoom: false,
    dragPan: false,
    dragRotate: false,
    interactive: false,
    keyboard: false,
    pitchWithRotate: false,
    pixelRatio: 1,
    preserveDrawingBuffer: layer.preserveDrawingBuffer,
    scrollZoom: false,
    style: layer.style?.object,
    touchZoomRotate: false,
    transformRequest: (url, resourceType) => {
      if (url.indexOf('mapbox:') === 0) {
        return transformMapboxUrl(url, resourceType, layer.accessToken);
      }

      // Do any other transforms you want
      return { url };
    },
  });

  if (!Map) return;

  // The Maplibre Map control must resize with mapview Map targetElement.
  layer.mapview.Map.getTargetElement().addEventListener('resize', () =>
    maplibreMap.resize(),
  );

  // Handle layer.style.zIndex deprecation.
  if (layer.style.zIndex) {
    console.warn(
      `Layer: ${layer.key}, layer.style.zIndex has been deprecated. Use layer.zIndex instead.`,
    );
  }

  layer.L = new ol.layer.Layer({
    key: layer.key,
    render: (frameState) => {
      if (!layer.display) return;

      layer.container.style.visibility = 'visible';

      // adjust view parameters in mapbox
      maplibreMap.jumpTo({
        animate: false,
        bearing: (-frameState.viewState.rotation * 180) / Math.PI,
        center: ol.proj.toLonLat(frameState.viewState.center),
        zoom: frameState.viewState.zoom - 1,
      });

      return layer.container;
    },
    zIndex: layer.zIndex,
  });
};

// transformMapboxUrl and supporting functions are taken from https://github.com/rowanwins/maplibregl-mapbox-request-transformer

function transformMapboxUrl(url, resourceType, accessToken) {
  if (url.indexOf('/styles/') > -1 && url.indexOf('/sprite') === -1) {
    return {
      url: normalizeStyleURL(url, accessToken),
    };
  }

  if (url.indexOf('/sprites/') > -1) {
    return {
      url: normalizeSpriteURL(url, accessToken),
    };
  }

  if (url.indexOf('/fonts/') > -1) {
    return {
      url: normalizeGlyphsURL(url, accessToken),
    };
  }

  if (url.indexOf('/v4/') > -1) {
    return {
      url: normalizeSourceURL(url, accessToken),
    };
  }

  if (resourceType === 'Source') {
    return {
      url: normalizeSourceURL(url, accessToken),
    };
  }
}

function parseUrl(url) {
  const parts = url.match(/^(\w+):\/\/([^/?]*)(\/[^?]+)?\??(.+)?/);

  if (!parts) {
    throw new Error('Unable to parse URL object');
  }

  return {
    authority: parts[2],
    params: parts[4] ? parts[4].split('&') : [],
    path: parts[3] || '/',
    protocol: parts[1],
  };
}

function formatUrl(urlObject, accessToken) {
  const apiUrlObject = parseUrl('https://api.mapbox.com');

  urlObject.protocol = apiUrlObject.protocol;
  urlObject.authority = apiUrlObject.authority;
  urlObject.params.push(`access_token=${accessToken}`);

  const params = urlObject.params.length
    ? `?${urlObject.params.join('&')}`
    : '';

  return `${urlObject.protocol}://${urlObject.authority}${urlObject.path}${params}`;
}

function normalizeStyleURL(url, accessToken) {
  const urlObject = parseUrl(url);

  urlObject.path = `/styles/v1${urlObject.path}`;

  return formatUrl(urlObject, accessToken);
}

function normalizeGlyphsURL(url, accessToken) {
  const urlObject = parseUrl(url);

  urlObject.path = `/fonts/v1${urlObject.path}`;

  return formatUrl(urlObject, accessToken);
}

function normalizeSourceURL(url, accessToken) {
  const urlObject = parseUrl(url);

  urlObject.path = `/v4/${urlObject.authority}.json`;
  urlObject.params.push('secure');

  return formatUrl(urlObject, accessToken);
}

function normalizeSpriteURL(url, accessToken) {
  const urlObject = parseUrl(url);
  const path = urlObject.path.split('.');

  urlObject.path = `/styles/v1${path[0]}/sprite.${path[1]}`;

  return formatUrl(urlObject, accessToken);
}
