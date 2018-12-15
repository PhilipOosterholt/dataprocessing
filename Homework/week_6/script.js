var format = d3.format(",");

linechart()

// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              console.log(d)
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Number of deaths: </strong><span class='details'>" + format(d.nkill) +"</span>";
            })

var margin = {top: 200, right: 0, bottom: 0, left: 200},
            width = 1160 - margin.left - margin.right,
            height = 900 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
    .domain([0,10,250,500,1000,2500,7500,25000,50000])
    .range(["rgb(255,247,236)", "rgb(254,232,200)", "rgb(253,212,158)", "rgb(253,187,132)", "rgb(252,141,89)", "rgb(239,101,72)","rgb(215,48,31)","rgb(153,0,0)"]);

var path = d3.geoPath();

var svg = d3.select("#svg1")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

var projection = d3.geoMercator()
                   .scale(130)
                  .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);

queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.csv, "test.csv")
    .await(ready);

function ready(error, data, nkill) {
  var nkillById = {};

  nkill.forEach(function(d) { nkillById[d.id] = +d.nkill; });
  data.features.forEach(function(d) { d.nkill = nkillById[d.id] });

  svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(data.features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { return color(nkillById[d.id]); })
      .style('stroke', 'white')
      .style('stroke-width', 1.5)
      .style("opacity",0.8)
      // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover', function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
        });

  svg.append("path")
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);

  svg.append('text')
      .attr('class', "title")
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ width / 2 + ',' + 50 + ')')
      .text('Deaths by Terrorism between 2007-2017');

  svg.append('text')
      .attr('class', "h1")
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ 1000 + ',' + 50 + ')')
      .text('Introduction title');
}

function linechart() {

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 0 - margin.left - margin.right,
              height = 100 - margin.top - margin.bottom;

  svg2 = svg_element(margin, 100, 100)

  // test dataset
  year = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
  deaths = [100, 200, 200, 300, 250, 600, 900, 1000, 900, 1400, 1500]

  var x = d3.scaleTime().rangeRound([0, 500]);
  var y = d3.scaleLinear().rangeRound([500, 0]);

  var line = d3.line()
   .x(function(d) { return x(year)})
   .y(function(d) { return y(deaths)})
   x.domain(d3.extent(data, function(d) { return year}));
   y.domain(d3.extent(data, function(d) { return deaths }));


}

// makes svg element
function svg_element(margin, w, h) {

  // svg element
  let svg2 = d3.select("#svg2")
     .append('svg')
     .attr('width', w + margin.left + margin.right)
     .attr('height', h + margin.top + margin.bottom)
     .append('g')
     .attr('transform', `translate(${margin.left},${margin.top})`);

  return svg;
}

// provides (a function for the) linear scale for x values
function xScale(data) {

  bound = calculate_minmax(data);
  let x = d3.scaleLinear()
     .domain([bound.min, bound.max])
     .range([25, w - 25])
     .nice();
  return x;

}

// provides (a function for the) linear scale for y values
function yScale(data) {

  bound = calculate_minmax(data);
  let y = d3.scaleLinear()
     .domain([bound.min, bound.max])
     .range([h - 25, 25])
     .nice();
  return y;
}
