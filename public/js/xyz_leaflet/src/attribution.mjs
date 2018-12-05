import _xyz from './_xyz.mjs';

export function create() {

  const attribution = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'attribution'
    },
    appendTo: _xyz.map_dom
  });

  _xyz.utils.createElement({
    tag: 'a',
    options: {
      classList: 'logo',
      textContent: 'GEOLYTIX',
      href: 'https://geolytix.co.uk',
      target: '_blank'
    },
    appendTo: attribution
  });

  const attribution_links = _xyz.utils.createElement({
    tag: 'div',
    options: {
      id: 'attribution_links'
    },
    appendTo: attribution
  });

  const leaflet = _xyz.utils.createElement({
    tag: 'a',
    options: {
      classList: 'leaflet',
      innerHTML: '<i class="material-icons">favorite</i> Leaflet',
      href: 'https://leafletjs.com',
      target: '_blank'
    },
    appendTo: attribution_links
  });

  _xyz.utils.createElement({
    tag: 'a',
    options: {
      classList: 'xyz',
      textContent: ' XYZ',
      href: 'https://github.com/geolytix/xyz',
      target: '_blank'
    },
    appendTo: attribution_links
  });

}

export function set(attribution) {
  Object.entries(attribution).forEach(entry => {

    // Create new attribution for layer if the same attribution does not exist yet.
    if (!_xyz.attribution.layer[entry[0]]) _xyz.attribution.layer[entry[0]] = _xyz.utils.createElement({
      tag: 'a',
      appendTo : document.getElementById('attribution_links'),
      options: {
        textContent: entry[0],
        href: entry[1],
        target: '_blank'
      }
    });
  });
}

export function check() {
      
  remove();

  Object.values(_xyz.layers.list).forEach(layer => {
    if (layer.display && layer.attribution) set(layer.attribution);
  });
}

export function remove() {
  Object.values(_xyz.attribution.layer).forEach(entry => entry.remove());
  _xyz.attribution.layer = {};
}

export let layer = {};