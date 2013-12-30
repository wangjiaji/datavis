var w = 500, h = 100;
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
    .attr('x', function (_, i) {
	return i * barWidth;
    })
    .attr('y', 0)
    .attr('width', barWidth - barPadding)
    .attr('height', 100);

