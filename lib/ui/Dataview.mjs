export default async (_this) => {

  // Get _this.target by element ID if provided as string.
  _this.target = typeof _this.target === 'string' 
    && document.getElementById(_this.target)
    || _this.target

  // Assign _this.target div if not already defined.
  _this.target = _this.target instanceof HTMLElement
    && _this.target
    || mapp.utils.html.node`
      <div
        class="dataview-target"
        style="position: absolute; width: 100%; height: 100%">`

  // Update method for _this.
  _this.update = async () => {

    // Dataviews must not update without a query.
    if (!_this.query) return;

    const params = mapp.utils.queryParams(_this)

    const paramString = mapp.utils.paramString(params)

    const response = await mapp.utils
      .xhr(`${_this.host || _this.location.layer.mapview.host}/api/query?${paramString}`)

    if (response instanceof Error) return;

    if (typeof _this.responseFunction === 'function') return _this.responseFunction(response);
   
    typeof _this.setData === 'function' && _this.setData(response)
  };

  if (_this.toolbar) {

    _this.target = mapp.utils.html.node`
      <div class="dataview-target">`

    const toolbar_els = Object.keys(_this.toolbar).map(key => mapp.ui.elements.toolbar_el[key](_this))

    _this.panel = mapp.utils.html.node`
      <div class="grid">
        <div class="btn-row">${toolbar_els}</div>
        ${_this.target}`
      
  }

  // Create a ChartJS dataview is chart is defined.
  if (_this.chart) await Chart(_this);

  if (typeof _this.columns !== 'undefined') {
    console.warn('Table dataviews should be configured inside a tables object')

    _this.table = { columns: _this.columns }
  }

  // Create a Tabulator dataview if columns are defined.
  if (_this.table) await Table(_this);

  // Update the dataview on mapChange if set.
  _this.mapChange && _this.layer &&
    _this.layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {

      // Only update dataview if corresponding layer is visible.
      if (_this.layer && !_this.layer.display) return;

      // Only update dataview if _this.tab is active.
      if (_this.tab && !_this.tab.classList.contains("active")) return;

      // Execute mapChange if defined as function or dataview update method.
      typeof _this.mapChange === 'function'
        && _this.mapChange()
        || _this.update();
    });

  return _this;

};

async function Chart(_this) {
 
  const canvas = _this.target.appendChild(mapp.utils.html.node`<canvas>`);

  _this.ChartJS = await mapp.ui.utils.Chart(canvas, mapp.utils.merge({
    type: "bar",
    options: {
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          display: false
        }
      }
    }
  }, _this.chart));

  // Set chart data
  _this.setData = (data) => {

    if (_this.noDataMask && !data) {

      // Remove display from target
      _this.target.style.display = 'none'

      // Set no data mask on dataview target
      _this.mask = !_this.mask && _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)

    } else {

      // Remove existing dataview mask.
      _this.mask && _this.mask.remove()
      delete _this.mask

      // Set dataview target to display as block.
      _this.target.style.display = 'block'
    }

    // Create a dataset with empty data array if data is falsy.
    if (!data) {
      data = {
        datasets: [
          {
            data: []
          }
        ]
      }
    }

    // Set data in datasets array if no datasets are defined in data.
    if (!data.datasets) {
      data = {
        datasets: [
          {
            data: data
          }
        ]
      }
    }

    _this.data = data;

    // Assign datasets from chart object to data.datasets.
    _this.chart.datasets?.length &&
      data.datasets.forEach((dataset, i) =>
        Object.assign(dataset, _this.chart.datasets[i]));

    // Get labels from chart if not defined in data.
    data.labels = data.labels || _this.chart.labels

    // Set data to chartjs object.
    _this.ChartJS.data = data

    // Update the chartjs object.
    _this.ChartJS.update();
  };

}

async function Table(_this) {

  // Assign column formatter from plugin.
  // (function colPlugins(cols) {
  //   cols.forEach((col) => {
  //     if (col.plugin) col.formatter = mapp.plugins[col.plugin];
  //     col.columns && colPlugins(col.columns);
  //   });
  // })(_this.columns);

  _this.Tabulator = await mapp.ui.utils.Tabulator(
    _this.target,
    _this.table);

  // Assign rowClick event on selectable table dataview.
  _this.table.selectable && _this.Tabulator.on("rowClick", (e, row) => {

    // The dataview rowSelect method may be used as callback to alter the seletable rowClick behaviour.
    if (typeof _this.rowSelect === 'function') {
      _this.rowSelect(e, row)
      return;
    }

    const rowData = row.getData();

    if (!_this.layer || !rowData[_this.layer.qID]) return;

    mapp.location.get({
      layer: _this.layer,
      id: rowData[_this.layer.qID],
    });

    // Remove selection colour on row element.
    row.deselect();
  });

  // Set Tabulator data.
  _this.setData = (data) => {

    if (!data && _this.data) return;

    if (_this.noDataMask && !data) {

      // Remove display from target
      _this.target.style.display = 'none'

      // Set no data mask on dataview target
      _this.mask = !_this.mask && _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)

    } else {

      // Remove existing dataview mask.
      _this.mask && _this.mask.remove()
      delete _this.mask

      // Set dataview target to display as block.
      _this.target.style.display = 'block'
    }

    // Tabulator data must be an array.
    data = (!data && []) || (data.length && data) || [data];

    // Set data to the tabulator object
    _this.Tabulator.setData(data);

    // Assign data to the dataview object
    _this.data = data;

    typeof _this.setDataCallback === 'function'
      && _this.setDataCallback(_this)
  }

}