var format = d3.format(",");


// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              console.log(d)
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Number of deaths: </strong><span class='details'>" + format(d.nkill) +"</span>";
            })

var margin = {top: 150, right: 325, bottom: 0, left: 0},
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
    .defer(d3.json, "line.json")
    .await(ready);

function ready(error, data, nkill, data2) {
  var nkillById = {};

  linechart(data2)


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

function linechart(data) {

  // 2
  var margin = {top: 225, right: 50, bottom: 25, left: 50},

  width = 600 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

  test = data['Afghanistan']
  test = Object.keys(test)
  data_test = data['Afghanistan']

  // test dataset
  years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
  data.death = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]

  // The number of datapoints
  var n = 11;

  max = Math.max.apply(Math, data_test)
  max = max * 1.5
  max = Math.round(max)

  // 5. X scale will use the index of our data
  var xScale = d3.scaleLinear()
      .domain([2007, 2017]) // input
      .range([25, width]); // output

  // 6. Y scale will use the randomly generate number
  var yScale = d3.scaleLinear()
      .domain([0, max]) // input
      .range([height, 0]); // output

  // 7. d3's line generator
  var line = d3.line()
      .x(function(d, i) {
        return xScale(years[i]); }) // set the x values for the line generator
      .y(function(d, i) {
        y = data_test[i]
        return yScale(y); }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line

  // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
  var dataset = d3.range(n).map(function(d, i) { return {"y": data.death[i] } })

  // 1. Add the SVG to the page and employ #2
  var svg2 = d3.select("#svg2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // 3. Call the x axis in a group tag
  svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  svg2.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // 9. Append the path, bind the data, and call the line generator
  svg2.append("path")
      .datum(dataset) // 10. Binds data to the line
      .attr("stroke", "#ffab00")
      .attr("fill", "none")
      .attr("stroke-width", '3')
      .attr("class", "line") // Assign a class for styling
      .attr("d", line); // 11. Calls the line generator

  // 12. Appends a circle for each datapoint
  svg2.selectAll(".dot")
      .data(dataset)
    .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d, i) { return xScale(test[i]) })
      .attr("cy", function(d) { return yScale(d.y) })
      .attr("r", 3)
      .attr('fill', '#ffab00')
      .attr('stroke', '#fff');
}
