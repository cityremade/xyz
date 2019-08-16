export default _xyz => entry => {

	const graph = _xyz.utils.createElement({
		tag: 'div',
		style: {
			position: 'relative'
		}
	});

	const canvas = _xyz.utils.createElement({
		tag: 'canvas',
        options: {
            height: entry.chart.height || 150,
            width: entry.chart.width || 350
        },
        style: {
            height: `${entry.chart.height}px` || `150px`,
            width: `${entry.chart.width}px` || '350px'
        },
		appendTo: graph
	});

	let data = [];

	let labels = Object.values(entry.columns).map(column => column.title),
	    columns = Object.values(entry.columns).map(column => column.field);

	let _label = columns[3],
	    _x = columns[0],
	    _y = columns[1],
	    _r = columns[2];

	entry.fields.map(d => {

		data.push({
			label: d[_label] || d.qid,
			id: d.qid,
			backgroundColor: entry.chart.backgroundColor || random_rgba(),
			data: [{
				x: d[_x],
				y: d[_y],
				r: d[_r]
			}]
		});

	});

	let chart = new _xyz.Chart(canvas, { 
		type: 'bubble',
		options: {
			legend: {
				display: entry.chart.legend || false,
				position: 'bottom'
			},
			tooltips: {
                callbacks: {
    				title: () => ''
    			}
    		},
    		scales: {
    			xAxes: [{
    				scaleLabel: {
    					display: true,
                        labelString: labels[0]
                    }
                }],
                yAxes: [{
                	scaleLabel: {
                		display: true,
                		labelString: labels[1]
                	}
                }]
            },
            onClick : (evt, item) => {
            	let element = chart.getElementAtEvent(evt)[0];
            	if(element){
            		let chartData = element['_chart'].config.data;
            		let idx = element['_datasetIndex'];

            		let label = chartData.datasets[idx].label;
            		let value = chartData.datasets[idx].data[0];
            		let id = chartData.datasets[idx].id;
            		let color = chartData.datasets[idx].backgroundColor;

            		let data_point = {
            			label: label,
            			id: id, 
            			color: color,
            			value: value
            		};

            		console.log(data_point);

            		alert('Do something with data point \n ' + JSON.stringify(data_point));
            	}
            }
        },
        data: {
        	datasets: data
        }
    });

    return graph;
}

function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    //return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ', 0.3)';
}