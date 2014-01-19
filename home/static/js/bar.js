var w = 600, h = 350;
var dataset = [];
var padding = 25;

for (var i = 0; i < 20; i++)
    dataset.push({key: i, value: Math.round(Math.random() * 30)});

var barWidth = w / dataset.length;

var key = function(d) {
    return d.key;
}

var xScale = d3.scale.ordinal()
    .domain(d3.range(dataset.length))
    .rangeRoundBands([padding, w], 0.05);

var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) { return d.value; })])
    .range([h - padding, padding]);

var svg = d3.select('div.container').append('svg')
    .attr({
	'width': w,
	'height': h
    });

svg.selectAll('rect').data(dataset, key).enter()
    .append('rect')
    .classed('bar', true)
    .attr({
	'x': function(_, i) { return xScale(i); },
	'y': function (d) { return yScale(d.value); },
	'width': xScale.rangeBand(),
	'height': function (d) { return h - yScale(d.value) - padding; },
	'title': _.identiy
    })
    .on('click', function (d) { console.log(d); });

svg.selectAll('text').data(dataset, key).enter()
    .append('text')
    .classed('bar', true)
    .text(function (d) { return d.value; })
    .attr({
	'x': function (d, i) { return xScale(i) + xScale.rangeBand() / 2; },
	'y': function (d) { return yScale(d.value) + 10; }
    });

d3.select('#change-data').on('click', function () {
    for (var d of dataset) {
	d.value = Math.round(Math.random() * 30);
    }
    
    yScale = d3.scale.linear()
	.domain([0, d3.max(dataset)])
	.range([h - padding, padding]);

    svg.selectAll('rect').data(dataset, key)
	.transition().duration(1000)
	.each('start', function () {
	    d3.select(this).attr('fill', 'magenta');
	})
	.attr({
	    'y': yScale,
	    'height': function (d) { return h - padding - yScale(d.value); },
	    'title': _.identity
	})
	.each('end', function () {
	    d3.select(this).attr('fill', 'green');
	});
    
    svg.selectAll('text').data(dataset, key)
	.text(_.identity)
	.attr({
	    'x': function (_, i) { return xScale(i) + xScale.rangeBand() / 2; },
	    'y': function (d) { return yScale(d.value) + 10; }
	});

    yAxis = d3.svg.axis()
	.scale(yScale)
	.orient('left')
	.ticks(yScale.ticks().length);

    svg.select('g').transition().duration(1000).attr('transform', 'translate(' + padding + ')').call(yAxis);
});

d3.select('#insert-data').on('click', function () {
    var maxValue = 30;
    var newNumber = Math.round(Math.random() * maxValue);
    dataset.push(newNumber);

    xScale.domain(d3.range(dataset.length));

    var bars = svg.selectAll('rect').data(dataset, key);
    bars.enter()
	.append('rect')
	.attr({
	    'x': w,
	    'y': yScale,
	    'width': xScale.rangeBand(),
	    'height': function (d) { return h - padding - yScale(d.value); },
	    'fill': 'green'
	})
	.transition()
	.attr('fill', 'blue');
    bars.transition()
	.attr({
	    'x': function (_, i) { return xScale(i); },
	    'width': xScale.rangeBand()
	});
});

d3.select('#remove-data').on('click', function () {
    dataset.shift();

    var bars = svg.selectAll('rect').data(dataset, key);
    bars.exit()
	.transition()
	.attr('x', -xScale.rangeBand())
	.remove();

    xScale.domain(d3.range(dataset.length));    
    bars.transition()
	.attr({
	    'x': function (_, i) { return xScale(i); },
	    'width': xScale.rangeBand(),
	});
});

var sortBars = function () {
    svg.selectAll('rect')
	.sort(function (a, b) {
	    return d3.ascending(a.value, b.value);
	})
	.transition()
	.attr('x', function (_, i) {
	    return xScale(i);
	});
}

d3.select('#sort-data').on('click', sortBars);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(yScale.ticks().length);

svg.append('g')
    .classed('axis', true)
    .attr('transform', 'translate(' + padding + ')')
    .call(yAxis);
