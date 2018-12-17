// JSON files
var files = ["world_countries2.json", "line.json"];

// load files
Promise.all(files.map(url => d3.json(url))).then(function(values) {

  // csv file
  d3.csv('test.csv')
    .then(function(nkill) {
    // give map function the data
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
let margin = {top: 150, right: 325, bottom: 0, left: 0},
            width = 1160 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;

// variables for selection line graph purposes
names = []
data_line = []

// dynamic color sizes
color_range = {min: 'rgb(255,247,236)', max: 'rgb(50,0,0)'};
color = color_map(color_range);

// world map stuff
var path = d3.geoPath();

// call world map svg element
var svg_map = d3.select("#svg1")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

svg_map.draw = "False"

// world map stuff
var projection = d3.geoMercator()
                  .scale(130)
                  .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);
svg_map.call(tip);

// map function j
// map is adapated from
function map(values, nkill) {
  var nkillById = {};

  // data
  data = values[0]
  data2 = values[1]

  // update data with number of deaths information
  nkill.forEach(function(d) { nkillById[d.id] = +Math.round(d.nkill); })
  data.features.forEach(function(d) { d.nkill = nkillById[d.id] })

  // draw line graph, return svg element for linked views
  svg_line = draw_chart(values[1], svg_map)

  // world map
  svg_map.append("g")
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
              .style('opacity', 1)
              .style('stroke','white')
              .style('stroke-width',3);
          })
          .on('click', function(d) {

            // if the user already has generated a graph, and clicks on new
            // countries, reset everthing
            if (svg_map.draw === 'True') {
              names = []
              data_line = []
              clear_lines(svg_line)
              svg_map.draw = 'False'
            }

          // country name of selection
          name = Object.values(d.properties)[0]

          // if data is not present, there were no deaths in said country,
          // so we give an array of eleven zeros as data
          if (data2[name] == null) {
            data_line.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
          }
          // if there were kills, append data to data_line for line graph
          else {data_line.push(data2[name])}

          // append names
          names.push(name)

          // if selectio is smaller than 5, add names to selected names
          if (names.length < 4) {selection(svg_map, name, names.length)};

          // if user selected four countries, draw the line graph
          if (names.length === 3) {
            draw_new_line(svg_line, svg_map, data_line, names, svg_line.width, svg_line.height)
          }

        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style('opacity', 0.8)
            .style('stroke','white')
            .style('stroke-width',0.3);
        });

  // world map path
  svg_map.append('path')
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
      .attr('class', 'names')
      .attr('d', path);

  // title
  svg_map.append('text')
      .attr('class', 'title')
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ width / 2 + ',' + 25 + ')')
      .text('Deaths by Terrorism between 2007-2017');

  // title
  svg_map.append('text')
      .attr('class', 'text')
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ (width - 115) + ',' + 60 + ')')
      .text('Your current selection:');


  // creates legend color
  legend_color(svg_map, 500, 575, color, 'Deaths')

}

// function draws the initial graph without the lines themselves yet
function draw_chart(data, svg_map) {

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
  var svg_line = d3.select("#svg2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // call x axis
  svg_line.append("g")
      .attr("id", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // call y axis
  svg_line.append("g")
      .attr("id", "yaxis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // title
  svg_line.append('text')
  .attr('class', "title_line")
  .attr("transform", "translate(" + 0  +  "," + -25 + ")")
  .text('Deaths by terrorism between 2007-2017 by country')

  // clears line graph from selection
  svg_line.append('text')
  .attr('class', "button")
  .attr("transform", "translate(40,25)")
  .text('CLEAR')
  .on('click', function(d, i) {
    clear_lines(svg_line)
    remove_selection(svg_map)
    names = []
    data_line = []
  });

  // give the proper width and heights to the map function
  // otherwise we cannot dynamically change the sizes
  svg_line.width = width
  svg_line.height = height

  // button for 2 country line graph
  svg_line.append('text')
  .attr('class', "button")
  .attr("transform", "translate(150,25)")
  .text('DRAW')
  .on('click', function(d, i) {
    // updates size and clears the line graph
    draw_new_line(svg_line, svg_map, data_line, names, svg_line.width, svg_line.height)
  });

  // return svg for linked views with worldmap
  return svg_line
}

function draw_new_line(svg_line, svg_map, data, names, width, height){

  // only draw when the user has not generated a graph before without
  // resetting the selection
  if (svg_map.draw === 'False') {

  // year range
  years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
  // color range, colorblind safe
  colors = ['#1b9e77', '#d95f02',  '#7570b3']

  // parsetie function for proper time scales
  var parseTime = d3.timeParse("%Y");

  // update maximum of range
  max = 0
  for (var i = 0; i < names.length; i++) {
    current_max = Math.max.apply(Math, data[i])
    if (current_max > max) {max = current_max};
  }

  // make the range a tad lager
  max = Math.round(max) * 1.3;

  // set minimum of maximum range
  if (max < 50) { max = 50 }

  // line function
  var line = d3.line()
      .x(function(d, i) {
        return xScale(parseTime(years[i])); }) // set the x values for the line generator
      .y(function(d) {
        return yScale(d); }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line

  // x time scale
  var xScale = d3.scaleTime()
      .domain([parseTime(2007), parseTime(2017)]) // input
      .range([25, width]); // output

  // y scale
  var yScale = d3.scaleLinear()
      .domain([0, max]) // input
      .range([height, 0]); // output

// draw lines
for (var i = 0; i < names.length; i++) {
  svg_line.append("path")
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

  for (var i = 0; i < names.length; i++) {
    // legend with country names and respective colors
    svg_line.append('text')
    .attr('class', "legend")
    .attr("transform", "translate(" + (width + 25) + "," + (height / 15 + i * 20) + ")")
    .attr("fill", colors[i])
    .text(names[i])
  }

    svg_map.draw = "True";

    remove_selection(svg_map)
  }
  }

  // clears path and legend elements from svg
  function clear_lines(svg_line) {
    d3.selectAll('.line').remove()
    d3.selectAll('.legend').remove()
  }


  function color_map(ranges) {
    // color coding, I use an aribtray map here, because otherwise it's
    // incredibly difficult to see the other countries besides Iraq and
    // Afghanistan
    let range = d3.scaleLinear()
       .domain([0, 5000])
       .range([ranges.min, ranges.max])
       .clamp(true);

    return range;
  }

  // makes a color legend for a variable
  function legend_color(svg_map, x_pos, y_pos, color, title) {

    // creates element for legend
    svg_map.append('g')
       .attr('class', 'legendLinear')
       .attr('transform', 'translate(' + x_pos + ', ' + y_pos + ')');

    // legend information
    let legendLinear = d3.legendColor()
       .shapeWidth(50)
       .orient('horizontal')
       .labels(labels)
       .scale(color)
       .title(title);

    // creates the legend
    svg_map.select('.legendLinear')
       .call(legendLinear);
  }

  // updates the selected countries on the world map
  function selection(svg_map, name, padding) {

  svg_map.append('text')
      .attr('class', "selection")
      .style('text-anchor', 'middle')
      .attr('transform', 'translate('+ (width - 115) + ',' + (60 + (padding * 20)) + ')')
      .text(name);
  }

  // removes selection
  function remove_selection(svg_map) {d3.selectAll('.selection').remove()};

  // source https://d3-legend.susielu.com/#color
  function labels({
    i,
    genLength,
    generatedLabels,
    labelDelimiter
  }) {
      // for (var i = 0; i < 5; i++) {
      //   generatedLabels[i] = Math.round(generatedLabels[i])
      //   // generatedLabels[i] = String(generatedLabels[i])
      //   console.log(generatedLabels[i])
      //   return generatedLabels[i]
      // }
     if (i === genLength - 1) {
      generatedLabels[i] = Math.round(generatedLabels[i])
      generatedLabels[i] = String(generatedLabels[i])
      const values = generatedLabels[i].split(` ${labelDelimiter} `)
      return `${values[0]}+`
    }
    else {
      generatedLabels[i] = Math.round(generatedLabels[i])
      generatedLabels[i] = String(generatedLabels[i])
    }
    return generatedLabels[i]
  }
