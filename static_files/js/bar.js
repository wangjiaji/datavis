var w = 600, h = 350;
var dataset = [];
var padding = 25;

for (var i = 0; i < 20; i++)
    dataset.push(Math.round(Math.random() * 30));

var barWidth = w / dataset.length;

var xScale = d3.scale.ordinal()
    .domain(d3.range(dataset.length))
    .rangeRoundBands([padding, w], 0.05);

var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset)])
    .range([h - padding, padding]);

var svg = d3.select('div.container').append('svg')
    .attr({
	'width': w,
	'height': h
    });

svg.selectAll('rect').data(dataset).enter()
    .append('rect')
    .classed('bar', true)
    .attr({
	'x': function(d, i) { return xScale(i); },
	'y': yScale,
	'width': xScale.rangeBand(),
	'height': function (d) { return h - yScale(d) - padding; },
	'title': _.identiy
    });

svg.selectAll('text').data(dataset).enter()
    .append('text')
    .classed('bar', true)
    .text(_.identity)
    .attr({
	'x': function (d, i) { return xScale(i) + xScale.rangeBand() / 2; },
	'y': function (d) { return yScale(d) + 10; }
    });

d3.select('#change-data').on('click', function () {
    for (var i = 0; i < dataset.length; i++)
	dataset[i] = Math.round(Math.random() * 30);
    
    yScale = d3.scale.linear()
	.domain([0, d3.max(dataset)])
	.range([h - padding, padding]);

    svg.selectAll('rect').data(dataset)
	.transition().duration(1000)
	.each('start', function () {
	    d3.select(this).attr('fill', 'magenta');
	})
	.attr({
	    'y': yScale,
	    'height': function (d) { return h - padding - yScale(d); },
	    'title': _.identity
	})
	.each('end', function () {
	    d3.select(this).attr('fill', 'green');
	});
    
    svg.selectAll('text').data(dataset)
	.text(_.identity)
	.attr({
	    'x': function (d, i) { return xScale(i) + xScale.rangeBand() / 2; },
	    'y': function (d) { return yScale(d) + 10; }
	});

    yAxis = d3.svg.axis()
	.scale(yScale)
	.orient('left')
	.ticks(yScale.ticks().length);

    svg.select('g').transition().duration(1000).attr('transform', 'translate(' + padding + ')').call(yAxis);
});

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(yScale.ticks().length);

svg.append('g')
    .classed('axis', true)
    .attr('transform', 'translate(' + padding + ')')
    .call(yAxis);
