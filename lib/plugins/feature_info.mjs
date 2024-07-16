/**
@module /plugins/feature_info
*/

/**
@function feature_info
@description
The feature_info plugin method creates a button for the mapButton list.

The button will toggle a custom highlight interaction with the getFeature method displaying the feature info in a popup.

@param {mapview} mapview The mapview for the highlight feature info interaction.
*/

export function feature_info(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // The btnColumn element only exists in the default mapp view.
  if (!btnColumn) return;

  const btn = mapp.utils.html.node`
      <button
        title=${mapp.dictionary.toolbar_current_location}
        onclick=${toggleFeatureInfoHighlight}><div class="mask-icon feature-info">`;

  btnColumn.append(btn);

  function toggleFeatureInfoHighlight() {

    if (btn.firstChild.classList.toggle('active')) {

      mapview.interactions.highlight({
        getFeature: feature => {

          const feature_info = {
            id: feature.id,
            layer: feature.layer.key,
            properties: feature.F.properties
          }

          const content = mapp.utils.html.node`<pre
            style="padding: 1em;"
            >${JSON.stringify(feature_info, undefined, 2)}`

          mapview.popup({
            content
          })
        },
        callback: () => {
          btn.firstChild.classList.remove('active')
        }
      });

    } else {

      mapview.interactions.highlight()
    };

  }
}