mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Select filter from list',
  },
  de: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Filter Auswahl',
  },
  cn: {
    layer_filter_header: '筛选',
    layer_filter_select: '从列表筛选',
  },
  pl: {
    layer_filter_header: 'Filtruj',
    layer_filter_select: 'Wybierz filtr z listy',
  },
  ko: {
    layer_filter_header: '필터',
    layer_filter_select: '리스트로 부터 필터 선택',
  },
  fr: {
    layer_filter_header: 'Filtres',
    layer_filter_select: 'Choisir un filtre dans la liste',
  },
  ja: {
    layer_filter_header: 'フィルター',
    layer_filter_select: 'リストからフィルターを選択',
  }
})

export default layer => {

  // Do not create the panel.
  if (layer.filter.hidden) return;

  if (!layer.infoj?.some((entry) => entry.filter)) return;

  layer.filter.list = layer.infoj
    .filter(entry => entry.filter)
    .filter(entry => !layer.filter?.exclude?.includes(entry.field))
    .map(entry => {
      entry.title = entry.filter.title || entry.title || entry.field
      return entry
    })

  const dropdown = mapp.ui.elements.dropdown({
    data_id: `${layer.key}-filter-dropdown`,
    placeholder: mapp.dictionary.layer_filter_select,
    entries: layer.filter.list,
    callback: async (e, entry) => {
      
      // Display clear all button.
      layer.filter.view.querySelector('[data-id=clearall]').style.display = 'block';

      if (entry.filter.card) return;

      // The filter is defined as a string e.g. "like"
      if (typeof entry.filter === 'string') {

        // Create filter object with the filter key value as type.
        entry.filter = { 
          type: entry.filter,
          field: entry.field
        }
      }

      entry.filter.remove = () => {
        delete layer.filter.current[entry.filter.field];
        delete entry.filter.card
        layer.reload();

        // The changeEnd event will trigger dataview updates if set.
        layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))

        // enable zoomToExtent button.
        let btn = layer.view.querySelector('[data-id=zoomToExtent]')
        if (btn) btn.disabled = false;
    
        // Only show the clearall filter button when filter cards are displayed as children to the filter view.
        layer.filter.view.querySelector('[data-id=clearall]').style.display = layer.filter.view.children.length === 3 ? 'none' : 'block';
      };

      if (!mapp.ui.layers.filters[entry.filter.type]) return;

      // If not implicit in the filter object the field will be assigned from the entry.
      entry.filter.field = entry.filter.field || entry.field

      let content = await mapp.ui.layers.filters[entry.filter.type](layer, entry);

      // Ensure that input is an array.
      content = Array.isArray(content) ? content : [content];

      // Add meta element to beginning of contents array.
      entry.filter.meta && content.unshift(mapp.utils.html.node`<p>${entry.filter.meta}`)

      entry.filter.card = layer.filter.view.appendChild(mapp.ui.elements.card({
        header: entry.filter.title || entry.title,
        close: entry.filter.remove,
        content
      })).title
    }
  })

  const clearAll = mapp.utils.html`
    <button
      data-id=clearall
      class="primary-colour"
      style="display: none; margin-bottom: 5px;"
      onclick=${e => {

        layer.filter.list
          .filter((entry) => entry.filter.card)
          .forEach(entry => {
            entry.filter.card.querySelector('[data-id=close]').click()
          })

        // enable zoomToExtent button.
        let btn = layer.view.querySelector('[data-id=zoomToExtent]')
        if (btn) btn.disabled = false;

        layer.reload()

      }}>${mapp.dictionary.layer_filter_clear_all}`

  layer.filter.view = mapp.ui.elements.drawer({
    data_id: `filter-drawer`,
    class: 'raised',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${dropdown}
      ${clearAll}`
  })

  return layer.filter.view
}
