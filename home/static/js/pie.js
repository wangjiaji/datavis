var getValue = function (d) {
    return d.value;
}

var w = 300, h = 300;

var outerRadius = w / 2;
var innerRadius = w / 4;
var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var svg = d3.select('body')
    .append('svg')
    .attr({
	width: w,
	height: h
    });

var dataset = [];
for (var i = 0; i < 6; i++)
    dataset.push(Math.round(Math.random() * 50));

var pie = d3.layout.pie();
var arcs = svg.selectAll('g.arc').data(pie(dataset))
    .enter()
    .append('g')
    .classed('arc', true)
    .attr('transform', 'translate(' + outerRadius + ',' + outerRadius + ')')

var color = d3.scale.category10();
arcs.append('path')
    .attr({
	fill: function (_, i) {	return color(i); },
	d: arc
    });

arcs.append('text')
    .attr({
	transform: function (d) {
	    return 'translate(' + arc.centroid(d) + ')';
	},
	'text-anchor': 'middle'
    })
    .text(getValue);

