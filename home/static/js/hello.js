var w = 600, h = 300, padding = 30;
var dataset = [];
for (var i = 0; i < 20; i++)
    dataset.push(Math.round(Math.random() * 30));

var barWidth = w / dataset.length;
var barPadding = 1;

d3.select('body').selectAll('div')
    .data(dataset)
    .enter()
    .append('div')
    .classed('bar', true)
    .style('height', function (d) {
	return (d * 5) + 'px';
    });

var svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

svg.selectAll('rect').data(dataset).enter()
    .append('rect')
    .classed('bar', true)
    .attr('x', function (_, i) {
	return i * barWidth;
    })
    .attr('y', function (d) {
	return h - d * 3;
    })
    .attr('width', barWidth - barPadding)
    .attr('height', function (d) {
	return d * 3;
    });

svg.selectAll('text').data(dataset).enter()
    .append('text')
    .text(function (d) {
	return d;
    })
    .classed('bar', true)
    .attr({
	'x': function (_, i) {
	    return i * barWidth + barWidth / 2;
	},
	'y': function (d) {
	    return h - d * 3 + 15;
	}
    });

svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

dataset = [
    [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
    [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]
];

svg.selectAll('circle').data(dataset).enter().append('circle')
    .attr('cx', function (d) {
	return d[0];
    })
    .attr('cy', function (d) {
	return h - d[1];
    })
    .attr('r', function (d) {
	return Math.sqrt(d[1]);
    });

svg.selectAll('text').data(dataset).enter().append('text')
    .classed('scatter', true)
    .text(function (d) {
	return d[0] + ', ' + d[1];
    })
    .attr('x', function (d) {
	return d[0];
    })
    .attr('y', function (d) {
	return h - d[1];
    });


dataset = [];

var numDataPoints = 50;
var xRange = Math.random() * 1000;
var yRange = Math.random() * 1000;

for (var i = 0; i < numDataPoints; i++) {
    var x = Math.floor(Math.random() * xRange);
    var y = Math.floor(Math.random() * yRange);
    dataset.push([x, y]);
}

var xScale = d3.scale.linear()
    .domain([
	d3.min(dataset, function (d) {
	    return d[0];
	}),
	d3.max(dataset, function (d) {
	    return d[0];
	})])
    .range([padding, w - padding]);

var yScale = d3.scale.linear()
    .domain([
	0,
	d3.max(dataset, function (d) {
	    return d[1];
	})])
    .range([h - padding, padding]);

var rScale = d3.scale.sqrt()
    .domain([
	0,
	d3.max(dataset, function (d) {
	    return d[1];
	})
    ])
    .range([
	0,
	Math.sqrt(d3.max(dataset, function (d) {
	    return d[1];
	}))
    ]);

svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);


svg.selectAll('circle').data(dataset).enter().append('circle')
    .attr('cx', function (d) {
	return xScale(d[0]);
    })
    .attr('cy', function (d) {
	return yScale(d[1]);
    })
    .attr('r', function (d) {
	return rScale(d[1]);
    });

svg.selectAll('text').data(dataset).enter().append('text')
    .classed('scatter', true)
    .text(function (d) {
	return d[0] + ', ' + d[1];
    })
    .attr('x', function (d) {
	return xScale(d[0]);
    })
    .attr('y', function (d) {
	return yScale(d[1]);
    });

var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(6);

svg.append('g').classed('axis', true)
    .attr('transform', 'translate(0, ' + (h - padding) + ')')
    .call(xAxis);

var yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(5);

svg.append('g').classed('axis', true)
    .attr('transform', 'translate(' + padding + ', 0)')
    .call(yAxis);
