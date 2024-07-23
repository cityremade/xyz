/**
## mapp.ui.layers.filters[type](layer, filter)

The ui/layers/filters module exports a lookup object for the different layer filter type methods.

- like
- match
- numeric
- integer
- in
- ni
- date
- datetime
- boolean
- null

@module /ui/layers/filters
*/

export default {
  like: filter_text,
  match: filter_text,
  numeric: filter_numeric,
  integer: filter_numeric,
  in: filter_in,
  ni: filter_in,
  date: filter_date,
  datetime: filter_date,
  boolean: filter_boolean,
  null: filter_null,
}

mapp.utils.merge(mapp.dictionaries, {
  en: {
    no_data_filter: 'This field contains no data and cannot be filtered on.',
    filter_searchbox_placeholder: 'Search',
    identical_values_filter: 'This field contains only one distinct value and cannot be filtered on.'
  },
  de: {
    no_data_filter: 'Dieses Feld enthält keine Daten und kann nicht gefiltert werden.'
  }
});

/**
### applyFilter(layer)

The applyFilter method reloads the layer data and legend.

The method is debounce through the module `timeout` variable.

@function applyFilter
@param {Object} layer Decorated MAPP Layer Object.
*/

let timeout;

function applyFilter(layer) {

  clearTimeout(timeout);

  // Debounce layer reload by 500
  timeout = setTimeout(() => {
    if (layer.style.legend) {
      mapp.ui.layers.legends[layer.style.theme.type](layer)
    }
    layer.reload();
    layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
  }, 500);
}

/**
 * @function filter_text
 * @description Creates an input element for filtering text values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The input element for text filtering.
 */
function filter_text(layer, filter) {
  return mapp.utils.html.node`
  <input
    type="text"
    onkeyup=${(e) => {
      if (!e.target.value.length) {

        // Delete filter for empty input.
        delete layer.filter.current[filter.field][filter.type]

        if (!Object.keys(layer.filter.current[filter.field])) {
          delete layer.filter.current[filter.field]
        }

      } else {

        layer.filter.current[filter.field] ??= {}
        layer.filter.current[filter.field][filter.type] = encodeURIComponent(`${filter.leading_wildcard && '%' || ''}${e.target.value}`)
      }
      applyFilter(layer)
    }}>`;
}

/**
 * @function filter_boolean
 * @description Creates a checkbox element for filtering boolean values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The checkbox element for boolean filtering.
 */
function filter_boolean(layer, filter) {

  function booleanFilter(checked) {
    layer.filter.current[filter.field] = {
      boolean: checked
    }
    applyFilter(layer)
  }

  booleanFilter(false)

  return mapp.ui.elements.chkbox({
    label: filter.label || filter.title || 'chkbox',
    onchange: booleanFilter
  })
}

/**
 * @function filter_null
 * @description Creates a checkbox element for filtering null values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The checkbox element for null filtering.
 */
function filter_null(layer, filter) {

  function nullFilter(checked) {
    layer.filter.current[filter.field] = {
      null: checked
    }
    applyFilter(layer)
  }

  nullFilter(false)

  return mapp.ui.elements.chkbox({
    label: filter.label || filter.title || 'chkbox',
    onchange: nullFilter
  })
}

/**
@function generateMinMax
@description
Queries the min and max bounds for a filter field. The min and max bounds can be implicit in the filter config.

@param {Object} layer MAPP layer object.
@param {Object} filter Filter object.
@param {string} filter.field Field to filter.
@param {numeric} [filter.min] Min bounds.
@param {numeric} [filter.max] Max bounds.
*/

async function generateMinMax(layer, filter) {

  const response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${mapp.utils.paramString({
    template: `field_minmax`,
    locale: layer.mapview.locale.key,
    layer: layer.key,
    table: layer.tableCurrent(),
    field: filter.field,
  })}`);

  // Assign min, max from response if not a number.
  const min = isNaN(filter.min) ? response.minmax[0]: filter.min
  const max = isNaN(filter.max) ? response.minmax[1]: filter.max

  // Parse min, max as interger or float depending on type.
  // Round integer to be correct up or down.
  filter.minmax[0] = filter.type === 'integer'? Math.round(min) : parseFloat(min)
  filter.minmax[1] = filter.type === 'integer'? Math.round(max) : parseFloat(max)
}

/**
@function filter_numeric
@description
Returns numeric inputs and range slider element as UI for numeric layer filter.

@param {Object} layer MAPP layer object.
@param {Object} filter Filter object.
@param {string} filter.field Field to filter.
@param {numeric} [filter.min] Min bounds.
@param {numeric} [filter.max] Max bounds.
@param {numeric} [filter.step] Step for renage slider.

@returns {Promise<HTMLElement>}
The filter UI elements.
*/

async function filter_numeric(layer, filter) {

  filter.minmax = [filter.min, filter.max];

  // Set min and max from response if not implicit.
  if (isNaN(filter.max) || isNaN(filter.min)) {

    await generateMinMax(layer, filter);
  }

  filter.step ??= filter.type === 'integer' ? 1 : 0.01;

  layer.filter.current[filter.field] = Object.assign(
    {
      gte: Number(filter.minmax[0]),
      lte: Number(filter.minmax[1])
    },
    layer.filter.current[filter.field]);

  applyFilter(layer);

  // If filter.min and filter.max are identical, return a message.
  if (filter.minmax[0] === filter.minmax[1]) {

    // Return text to indicate that the field contains only one distinct value.
    return mapp.utils.html.node`<div>${mapp.dictionary.identical_values_filter}</div>`
  };
  
  // Only if filter.min and filter.max are not numeric values, return a message.
  if (isNaN(filter.minmax[0]) || isNaN(filter.minmax[1])) {

    // Return text to indicate that the min and max values are not defined.
    return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`
  };

  const entry = layer.infoj.find(entry => entry.field === filter.field)

  // Create affix for rangeslider input label.
  const affix = (entry.prefix || entry.suffix)? `(${(entry.prefix || entry.suffix).trim()})`: ''

  // Set formatter and filterInput for tabulator inputs.
  entry.formatter ??= entry.formatterParams
  entry.filterInput = true

  // Create the range slider element.

  //Determine thousand and decimal markers
  const separators = mapp.utils.getSeparators(entry) || {decimals: '.'}

  return mapp.ui.elements.slider_ab({
    min: Number(filter.minmax[0]),
    max: Number(filter.minmax[1]),
    separators: separators,
    step: filter.step,
    entry: entry,
    label_a: `${mapp.dictionary.layer_filter_greater_than} ${affix}`, // Greater than
    val_a: mapp.utils.numericFormatter({... entry, ...{value: filter.minmax[0]} }),
    slider_a: Number(filter.minmax[0]),
    callback_a: e => {
      layer.filter.current[filter.field].gte = Number(e)
      applyFilter(layer)
    },
    label_b: `${mapp.dictionary.layer_filter_less_than}  ${affix}`, // Less than
    val_b: mapp.utils.numericFormatter({... entry, ...{value: filter.minmax[1]} }),
    slider_b: Number(filter.minmax[1]),
    callback_b: e => {
      layer.filter.current[filter.field].lte = Number(e)
      applyFilter(layer)
    }
  })
}

/**
@function filter_in

@description
Filter interface elements for `in` and `ni` type layer filter are returned from the filter_in() method.

The method is async to wait for a distinct values query to populate the filter type [eg. in or ni] values array.

A list of checkbox elements will be returned as default interface without a `dropdown`, `dropdown_pills`, or `searchbox` flag.

@param {Object} layer Decorated MAPP Layer Object.
@param {Object} filter The filter object.
@param {string} filter.field The filter field.
@param {Array} [filter.in] Array of values for in type filter.
@param {Array} [filter.ni] Array of values for ni type filter.
@param {Boolean} [filter.dropdown] Create dropdown [pills] filter interface.
@param {Boolean} [filter.dropdown_pills] Create dropdown [pills] filter interface.
@param {Boolean} [filter.searchbox] Create searchbox [pills] filter interface.
@returns {Promise<HTMLElement>} Filter interface elements.
*/

async function filter_in(layer, filter) {

  // Check whether a filter type values array has been provided.
  if (!Array.isArray(filter[filter.type])) {

    // Query distinct field values from the layer table.
    const response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'distinct_values',
        dbs: layer.dbs,
        locale: layer.mapview.locale.key,
        layer: layer.key,
        table: layer.tableCurrent(),
        field: filter.field,
        filter: layer.filter?.current
      }))

    if (!response) {
      console.warn(`Distinct values query did not return any values for field ${filter.field}`)

      // Set a div with a message that the field contains no data. 
      return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`
    }

    filter[filter.type] = [response]

      // Flatten response in array to account for the response being a single record and not an array.
      .flat()

      // Map the entry field from response records.
      .map(record => record[filter.field])

      // Filter out null values.
      .filter(val => val !== null)
  }

  // Create set to check for current values in the filter array.
  const chkSet = new Set(layer.filter?.current[filter.field]?.[filter.type] || []);

  if (filter.dropdown || filter.dropdown_pills) {

    const dropdown = mapp.ui.elements.dropdown({
      pills: filter.dropdown_pills,
      multi: true,
      inputfilter: true,
      placeholder: 'Select Multiple',
      maxHeight: 300,
      entries: filter[filter.type].map(val => ({
        title: val,
        option: val,
        selected: chkSet.has(val)
      })),
      callback: async (e, options) => {

        if (!options.length) {

          // Remove empty array filter.
          delete layer.filter.current[filter.field]
        } else {

          // Set filter values array from options.
          Object.assign(layer.filter.current, {
            [filter.field]: {
              [filter.type]: options
            }
          })
        }

        applyFilter(layer)
      }
    })

    return mapp.utils.html.node`<div class="filter">${dropdown}`
  }

  if(filter.searchbox) {

    const searchbox_filter = mapp.utils.html.node`<div class="filter">`

    const pillComponent = mapp.ui.elements.pills({
      target: searchbox_filter,
      addCallback: (val, pills) => {
        Object.assign(layer.filter.current, {
          [filter.field]: {
            [filter.type]: [...pills]
          }
        });
        applyFilter(layer);
      },
      removeCallback: (val, pills) => {

        if(pills.size === 0) {
          searchbox.input.value = null;

          //if nothing left selected delete the entire filter
          delete layer.filter.current[filter.field];

        } else {
          Object.assign(layer.filter.current, {
            [filter.field]: {
              [filter.type]: [...pills]
            }
          })
        }

        applyFilter(layer);
      }});

    const searchbox = mapp.ui.elements.searchbox({
      target: searchbox_filter,
      placeholder: mapp.dictionary.filter_searchbox_placeholder,
      searchFunction: (e) => {

        searchbox.list.innerHTML = '';

        if(!e.target.value) return; // nothing to match

        const pattern = e.target.value;

        let filtered = filter[filter.type].filter(val =>

          // val may not be string.
          val.toString().toLowerCase().startsWith(pattern.toLowerCase()))

        if (!filtered.length) {

          searchbox.list.append(mapp.utils.html.node`
            <li><span>${mapp.dictionary.no_results}`);

          return;
        }

        filtered
          .filter(val => !pillComponent.pills.has(val)) // only those not selected already
          .filter((val, i) => i < 9)
          .forEach(val => {

            // Append li element to searchbox.list
            searchbox.list.append(mapp.utils.html.node`
              <li onclick=${() => {

                // Add pill not yet in pillComponent
                !pillComponent.pills.has(val) && pillComponent.add(val);
              }}>${val}`)
          });
      }
    });

    return mapp.utils.html.node`${searchbox_filter}`;
  }

  const chkBoxes = filter[filter.type].map(val => mapp.ui.elements.chkbox({
    val: val,
    label: val,
    checked: chkSet.has(val),
    onchange: (checked, val) => {

      if (checked) {

        // Create filter object if it doesn't exist.
        if (!layer.filter.current[filter.field]) {
          layer.filter.current[filter.field] = {}
        }

        // Create empty in array if it doesn't exist.
        if (!layer.filter.current[filter.field][filter.type]) {
          layer.filter.current[filter.field][filter.type] = []
        }

        // Add value to filter array.
        layer.filter.current[filter.field][filter.type].push(val);

      } else {

        // Get index of value in filter array.
        const idx = layer.filter.current[filter.field][filter.type].indexOf(val);

        // Splice filter array on idx.
        layer.filter.current[filter.field][filter.type].splice(idx, 1);

        // Remove filter object if it is empty.
        if (!layer.filter.current[filter.field][filter.type].length) {
          delete layer.filter.current[filter.field]
        }
      }

      applyFilter(layer)
    }
  }))

  return mapp.utils.html.node`<div class="filter">${chkBoxes}`
}

/**
 * @function filter_date
 * @description Creates input elements for filtering date values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The input elements for date filtering.
 */
function filter_date(layer, filter) {

  const inputAfter = mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${onClose}
      type=${filter.type === 'datetime' && 'datetime-local' || 'date'}>`;

  const inputBefore = mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${onClose}
      type=${filter.type === 'datetime' && 'datetime-local' || 'date'}>`;

  function onClose(e) {

    if (e.target.dataset.id === 'inputAfter') {

      layer.filter.current[filter.field] = Object.assign(
        layer.filter.current[filter.field] || {},
        {
          gt: new Date(e.target.value).getTime() / 1000
        })

    }

    if (e.target.dataset.id === 'inputBefore') {

      layer.filter.current[filter.field] = Object.assign(
        layer.filter.current[filter.field] || {},
        {
          lt: new Date(e.target.value).getTime() / 1000
        })

    }

    applyFilter(layer)
  }

  return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${inputAfter}</label>
      <label>Date before
        ${inputBefore}</label>`

}