import query from './query.mjs';

import tabview from './tabview.mjs';

export default _xyz => {

  return {

    create: create,

    query: query(_xyz),
   
    tabview: tabview(_xyz),

  };

  function array(dataview) {

    dataview.dataviews.forEach(_dataview => {
      _dataview.layer = dataview.layer;
      _dataview.id = dataview.id;
      _dataview.target = _xyz.utils.wire()`
        <div class="${_dataview.class || ''}" style="${_dataview.style || ''}">`;
      dataview.target.appendChild(_dataview.target);
      create(_dataview);
    });

    return dataview;
  }

  function create(dataview) {

    dataview.target = dataview.target instanceof HTMLElement && dataview.target
    || _xyz.utils.wire()`<div class="${dataview.class || ''}" style="${dataview.style || ''}">`;

    if (dataview.dataviews) return array(dataview);

    if (dataview.script) {

      const script = _xyz.utils.wire()`<script src="${dataview.script}">`;

      function addDashboard(e) {
        e.detail(_xyz, dataview);
        document.removeEventListener('addDashboard', addDashboard);
        script.remove();
      }

      document.addEventListener('addDashboard', addDashboard, true);

      dataview.target.appendChild(script);

      return;
    }

    const toolbar = _xyz.utils.wire()`<div class="toolbar">`;

    dataview.target.appendChild(toolbar);

    const target = _xyz.utils.wire()`<div>`;

    dataview.target.appendChild(target);

    if (dataview.chart) {

      dataview.chart.div = _xyz.utils.wire()`<div style="position: relative;">`;

      const canvas = _xyz.utils.wire()`<canvas>`;

      if(dataview.chart.height) canvas.setAttribute('height', dataview.chart.height);
      if(dataview.chart.width) canvas.setAttribute('width', dataview.chart.width);
    
      dataview.chart.div.appendChild(canvas);
    
      if (!dataview.chart.datalabels) {
        _xyz.utils.Chart.defaults.global.plugins.datalabels.display = false;
      }
   
      dataview.chart.ChartJS = new _xyz.utils.Chart(canvas, {
        type: dataview.chart.type || 'bar',
        options: dataview.chart.options || {
          legend: {
            display: false
          }
        }
      });
    
      dataview.chart.options && Object.assign(dataview.chart.ChartJS.options, dataview.chart.options);
    
      dataview.chart.setData = response => {
    
        dataview.chart.ChartJS.data = {
          labels: dataview.chart.labels,
          datasets: dataview.chart.datasets.map(dataset => ({
            data: dataset.fields && dataset.fields.map(field => response[field]) || dataset.field && response[dataset.field] || response,
            fill: dataset.fill,
            backgroundColor: ()=>color(dataset.backgroundColor, dataset, response),
            borderWidth: dataset.borderWidth,
            borderColor: ()=>color(dataset.borderColor, dataset, response),
          }))
        }
    
      }
    
      function color(_color, dataset, response) {
    
        if (typeof _color === 'undefined') return _color;
    
        if (_color && _color !== 'random') return _color;
    
        if (dataset.fields) return dataset.fields.map(() => _xyz.utils.Chroma.random().hex());
    
        if (response.length) return response.map(() => _xyz.utils.Chroma.random().hex());
    
      }

      target.appendChild(dataview.chart.div);

      dataview.update = () => {

        dataview.promise = _xyz.dataviews.query(dataview);

        dataview.promise.then(response => {

          dataview.chart.setData(response);

          dataview.chart.ChartJS.update();

        });
      }
    }

    if (dataview.columns) {

      (function applyFormatters(cols){
        cols.forEach(col => {
          if(col.customFormatter) col.formatter = _xyz.utils.TabulatorFormatter[col.customFormatter];
          col.columns && applyFormatters(col.columns);
        });
      })(dataview.columns);

      dataview.Tabulator = new _xyz.utils.Tabulator(target, Object.assign({
        invalidOptionWarnings: false,
        tooltipsHeader: true,
        columnHeaderVertAlign: 'center',
        layout: 'fitDataFill',
        height: 'auto',
        selectable: false,
        rowClick: (e, row) => {
          const rowData = row.getData();
          if (!dataview.layer || !rowData.id) return;
          _xyz.locations.select({
            locale: _xyz.workspace.locale.key,
            layer: dataview.layer,
            table: dataview.layer.tableCurrent(),
            id: rowData.id,
            //_flyTo: true,
          });
          row.deselect();
        }
      }, dataview));

      dataview.update = () => {

        dataview.promise = _xyz.dataviews.query(dataview);

        dataview.promise.then(response => {

          dataview.Tabulator.setData(response.length && response || [response]);
          //dataview.Tabulator.redraw(true);

        });
      }
    }

    dataview.update();

    dataview.layer && _xyz.mapview.node && _xyz.mapview.node.addEventListener('changeEnd', () => {
      (dataview.target.classList.contains('active')
      || dataview.target.parentElement.classList.contains('active'))
      && dataview.update();
    });

    if (dataview.toolbar && dataview.viewport) toolbar.appendChild(_xyz.utils.wire()`
    <button
      class="off-white-hover primary-colour"
      onclick=${e => {
        e.target.classList.toggle('primary-colour');
        dataview.viewport = !dataview.viewport;
        dataview.update();
      }}>Viewport`)

    if (dataview.toolbar && dataview.download_csv) toolbar.appendChild(_xyz.utils.wire()`
    <button
      class="off-white-hover primary-colour"
      onclick=${() => {
        dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
      }}>Viewport`)

    if (dataview.toolbar && dataview.download_json) toolbar.appendChild(_xyz.utils.wire()`
    <button
      class="off-white-hover primary-colour"
      onclick=${() => {
        dataview.Tabulator.download('json', `${dataview.title || 'table'}.json`)
      }}>Viewport`)

    return dataview;

  }
    
};