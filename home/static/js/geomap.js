var svg = d3.select('body').append('svg').classed('map', true);

var path = d3.geo.path();

var color = d3.scale.quantize()
    .range(['rgb(237,248,233)',
	    'rgb(186,228,179)',
	    'rgb(116,196,118)',
	    'rgb(49, 163,84)',
	    'rgb(0,109,44)']);

var projection = d3.geo.albersUsa();

d3.csv('/static/js/us-ag-productivity-2004.csv', function (data) {
    color.domain([d3.min(data, function (d) { return d.value; }),
		  d3.max(data, function (d) { return d.value; })
		 ]);

    d3.json('/static/js/us-states.json', function (json) {
	for (var i = 0; i < data.length; i++) {
	    var dataState = data[i].state;
	    var dataValue = +data[i].value;

	    for (var j = 0; j < json.features.length; j++) {
		var jsonState = json.features[j].properties.name;
		if (dataState == jsonState) {
		    json.features[j].properties.value = dataValue;
		    break;
		}
	    }
	}

	var state = svg.selectAll('g.state').data(json.features).enter()
	    .append('g')
	    .classed('state', true);

	state.append('path')
	    .attr('d', path)
	    .style('fill', function (d) {
		var value = d.properties.value;
		if (value)
		    return color(value);
		else
		    return '#ccc';
	    });

	state.append('text')
	    .attr('transform', function (d) {
		return 'translate(' + path.centroid(d) + ')';
	    })
	    .text(function (d) { return d.properties.name; });
    });

    d3.csv('/static/js/us-cities.csv', function (data) {
    svg.selectAll('circle').data(data).enter()
	.append('circle')
	.attr({
	    cx: function (d) { return projection([d.lon, d.lat])[0]; },
	    cy: function (d) { return projection([d.lon, d.lat])[1]; },
	    r: function (d) { return Math.sqrt(+d.population) * 0.008; }
	})
	.style({
	    fill: 'red',
	    opacity: 0.75
	});
    });

});

