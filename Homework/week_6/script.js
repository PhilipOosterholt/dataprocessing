var files = ["world_countries2.json", "line.json"];

Promise.all(files.map(url => d3.json(url))).then(function(values) {

  d3.csv('test.csv')
    .then(function(nkill) {
    map(values, nkill)
  });
});


var format = d3.format(",");

// set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Number of deaths: </strong><span class='details'>" + format(d.nkill) +"</span>";
            })

// margins worldmap
var margin = {top: 150, right: 325, bottom: 0, left: 0},
            width = 1160 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;


// dynamic color sizes
color_range = {min: 'rgb(254,232,200)', max: 'rgb(0,0,0)'};
color = color_map(color_range);

// world map stuff
var path = d3.geoPath();

// call world map svg element
var svg = d3.select("#svg1")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

// world map stuff
var projection = d3.geoMercator()
                   .scale(130)
                  .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);
svg.call(tip);

// map function j
// map is adapated from
function map(values, nkill) {
  var nkillById = {};

  // data
  data = values[0]
  data2 = values[1]

  // update data with number of deaths information
  nkill.forEach(function(d) { nkillById[d.id] = +d.nkill; })
  data.features.forEach(function(d) {
    d.nkill = nkillById[d.id] })

  // draw line graph, return svg element for linked views
  svg2 = draw_chart(values[1], svg)
  names = []
  data_line = []

  // world map
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

          if (data2[name] == null) {
            data_line.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
          }
          else {
          data_line.push(data2[name])
          }

          names.push(name)

          if (names.length === svg2.line_size) {
            draw_new_line(svg2, svg, data_line, names, svg2.width, svg2.height)
          }

          if (names.length < (svg2.line_size + 1)) {
            selection(svg, name, names.length)
          }

        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
        });

  // world map path
  svg.append("path")
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);

  // title
  svg.append('text')
      .attr('class', "title")
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ width / 2 + ',' + 25 + ')')
      .text('Deaths by Terrorism between 2007-2017');

// for (var i = 0; i < 1, i++)
  // title
  svg.append('text')
      .attr('class', "text")
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ (width - 115) + ',' + 60 + ')')
      .text('Your current selection:');


  // creates legend color
  legend_color(svg, 500, 575, color, 'Deaths')

}

// function draws the initial graph without the lines themselves yet
function draw_chart(data, svg) {

  // margins
  var margin = {top: 310, right: 250, bottom: 25, left: 50},
  // width and height
  width = 800 - margin.left - margin.right,
  height = 655 - margin.top - margin.bottom;
  // minimal mamximum of line graph
  max = 50

  // selection of years
  years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]

  // for proper x scale years
  var parseTime = d3.timeParse("%Y");

  // x time scale
  var xScale = d3.scaleTime()
      .range([25, width]) // output
      .domain(d3.extent(years, function(d) { return parseTime(d)}));

  // y scale
  var yScale = d3.scaleLinear()
      .domain([0, max]) // input
      .range([height, 0]); // output

  // call svg element
  var svg2 = d3.select("#svg2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // call x axis
  svg2.append("g")
      .attr("id", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // call y axis
  svg2.append("g")
      .attr("id", "yaxis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // title
  svg2.append('text')
  .attr('class', "title_line")
  .attr("transform", "translate(" + 0  +  "," + -25 + ")")
  .text('Deaths by terrorism between 2007-2017 by country')

  // clears line graph from selection
  svg2.append('text')
  .attr('class', "button")
  .attr("transform", "translate(40,25)")
  .text('Clear graph')
  .on('click', function(d, i) {
    clear_lines(svg2)
    remove_selection(svg)
    names = []
    data_line = []
  });

  // button for 2 country line graph
  svg2.append('text')
  .attr('class', "button")
  .attr("transform", "translate(150,25)")
  .text('2 countries')
  .on('click', function(d, i) {
    // updates size and clears the line graph
    svg2.line_size = 2
    clear_lines(svg2)
    remove_selection(svg)
    names = []
    data_line = []
  });

  // button for 2 country line graph
  svg2.append('text')
  .attr('class', "button")
  .attr("transform", "translate(250,25)")
  .text('3 countries')
  .on('click', function(d, i) {
    // updates size and clears the line graph
    svg2.line_size = 3
    clear_lines(svg2)
    remove_selection(svg)
    names = []
    data_line = []
  });

  // give the proper width and heights to the map function
  // otherwise we cannot dynamically change the sizes
  svg2.width = width
  svg2.height = height
  svg2.line_size = 2

  // return svg for linked views with worldmap
  return svg2
}

function draw_new_line(svg, svg_map, data, names, width, height){

  max = 0
  years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
  colors = ['#fdbb84', '#e34a33',  '#525252']

  var parseTime = d3.timeParse("%Y");

  // update maximum of range
  for (var i = 0; i < svg.line_size; i++) {
    current_max = Math.max.apply(Math, data[i])
    if (current_max > max) {
      max = current_max;
    }
  }

  // make the range a tad lager
  max = Math.round(max) * 1.3;

  // set minimum of maximum range
  if (max < 50) {
    max = 50
  }

  // line function
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

for (var i = 0; i < svg.line_size; i++) {
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

  for (var i = 0; i < svg.line_size; i++) {
    // 9. Append the path, bind the data, and call the line generator
    svg.append('text')
    .attr('class', "legend")
    .attr("transform", "translate(" + (width + 25) + "," + (height / 15 + i * 20) + ")")
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

  function selection(svg, name, padding) {

  svg.append('text')
      .attr('class', "selection")
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ (width - 115) + ',' + (60 + (padding * 20)) + ')')
      .text(name);

      return svg
  }

  function remove_selection(svg) {

  d3.selectAll('.selection').remove()

      return svg
  }
