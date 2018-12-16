var format = d3.format(",");

// set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Number of deaths: </strong><span class='details'>" + format(d.nkill) +"</span>";
            })

// margins worldmap
var margin = {top: 125, right: 325, bottom: 0, left: 0},
            width = 1160 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;


// dynamic color sizes
color_range = {min: 'rgb(254,232,200)', max: 'rgb(0,0,0)'};
color = color_map(color_range);

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
    .defer(d3.json, "world_countries2.json")
    .defer(d3.csv, "test.csv")
    .defer(d3.json, "line.json")
    .await(map);

// map function j
// map is adapated from
function map(error, data, nkill, data2) {
  var nkillById = {};

  console.log(data)

  // draw line graph, return svg element for linked views
  svg2 = draw_chart(data2)
  names = []
  data_line = []

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
        .on("click", function(d) {

          name = Object.values(d.properties)[0]
          console.log(name)

          if (data2[name] == null) {
            data_line.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
          }
          else {
          data_line.push(data2[name])
          }

          names.push(name)

          if (names.length === 2) {
            draw_new_line(svg2, data_line, names, 500, 350)
          }

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

  legend_color(svg, 500, 575, color, 'Deaths')

}

function draw_chart(data) {

  // 2
  var margin = {top: 310, right: 250, bottom: 25, left: 50},

  width = 800 - margin.left - margin.right,
  height = 685 - margin.top - margin.bottom;
  max = 50

  years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
  // for proper x scale years
  var parseTime = d3.timeParse("%Y");

  // 5. X scale will use the index of our data
  var xScale = d3.scaleTime()
      // .domain([2007, 2017]) // input
      .range([25, width]) // output
      .domain(d3.extent(years, function(d) { return parseTime(d)}));

  // 6. Y scale will use the randomly generate number
  var yScale = d3.scaleLinear()
      .domain([0, max]) // input
      .range([height, 0]); // output

  // 1. Add the SVG to the page and employ #2
  var svg2 = d3.select("#svg2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // 3. Call the x axis in a group tag
  svg2.append("g")
      .attr("id", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  svg2.append("g")
      .attr("id", "yaxis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  svg2.append('text')
  .attr('class', "title_line")
  .attr("transform", "translate(" + 0  +  "," + -25 + ")")
  .text('Deaths by terrorism between 2007-2017 by country')

  svg2.append('text')
  .attr('class', "button")
  .attr("transform", "translate(25,25)")
  .text('Clear graph')
  .on('click', function(d, i) {
    clear_lines(svg2)
    names = []
    data_line = []
  });


  // return svg for linked views with worldmap
  return svg2
}

function draw_new_line(svg, data, names, width, height){

  max = 0
  years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
  colors = ['#fdbb84', '#525252']

  var parseTime = d3.timeParse("%Y");

  for (var i = 0; i < 2; i++) {
    current_max = Math.max.apply(Math, data[i])
    if (current_max > max) {
      max = current_max;
    }
  }

  max = Math.round(max) * 1.3;

  if (max < 50) {
    max = 50
  }

  // 7. d3's line generator
  var line = d3.line()
      .x(function(d, i) {
        return xScale(parseTime(years[i])); }) // set the x values for the line generator
      .y(function(d) {
        return yScale(d); }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line

  // 5. X scale will use the index of our data
  var xScale = d3.scaleTime()
      .domain([parseTime(2007), parseTime(2017)]) // input
      .range([25, width]); // output

  // 6. Y scale will use the randomly generate number
  var yScale = d3.scaleLinear()
      .domain([0, max]) // input
      .range([height, 0]); // output

for (var i = 0; i < 2; i++) {
  // 9. Append the path, bind the data, and call the line generator
  svg.append("path")
      .datum(data[i]) // 10. Binds data to the line
      .attr("stroke", colors[i])
      .attr("class", "line") // Assign a class for styling
      .attr("d", line); // 11. Calls the line generator
}

  // 3. Call the x axis in a group tag
  d3.selectAll('#xaxis')
      .transition()
      .duration(500)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  d3.selectAll('#yaxis')
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  for (var i = 0; i < 2; i++) {
    // 9. Append the path, bind the data, and call the line generator
    svg.append('text')
    .attr('class', "legend")
    .attr("transform", "translate(525," + (100 + i * 20) + ")")
    .attr("fill", colors[i])
    .text(names[i])
  }
  }

  // clears path and legend elements from svg
  function clear_lines(svg) {
    d3.selectAll('.line').remove()
    d3.selectAll('.legend').remove()
  }


  function color_map(ranges) {

    // color coding, I use an aribtray map here, because otherwise it's
    // incredibly difficult to see the other countries besides Iraq and
    // Afghanistan
    let range = d3.scaleLinear()
       .domain([0, 8000])
       .range([ranges.min, ranges.max]);
    return range;

  }

  // makes a color legend for a variable
  function legend_color(svg, x_pos, y_pos, color, title) {

    // creates element for legend
    svg.append('g')
       .attr('class', 'legendLinear')
       .attr('transform', 'translate(' + x_pos + ', ' + y_pos + ')');

    // legend information
    let legendLinear = d3.legendColor()
       .shapeWidth(50)
       .orient('horizontal')
       .scale(color)
       .title(title);

    // creates the legend
    svg.select('.legendLinear')
       .call(legendLinear);
  }
