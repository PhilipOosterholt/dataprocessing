// Philip Oosterholt - 10192263 - Week 5

window.onload = function() {
  data = load_data()
};

function load_data() {

  let data = 'https://stats.oecd.org/SDMX-JSON/data/BLI/AUS+CHL+FRA+DEU+GRC+HUN+ISR+ITA+JPN+MEX+NLD+POL+ESP+SWE+TUR+GBR+USA+BRA+RUS+ZAF.IW_HADI+JE_EMPL+SC_SNTWS+HS_LEB+SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions'
  let requests = [d3.json(data)];

  Promise.all(requests).then(function(response) {

    scatter(transformResponse(response, 5));

  }).catch(function(e){
      throw(e);
  });
}

// function from dataprocessing website
function transformResponse(data, len_vars){

  let len = data[0].structure.dimensions.observation[0].values.length
  let countries = [];

  for (i = 0; i < len; i++) {
    countries.push(data[0].structure.dimensions.observation[0].values[i].name);
  }

  let dict = data[0].dataSets[0].observations;
  let values = [];

  for (let key in dict){
    values.push(dict[key][0]);
  }

  let array = [];
  array.push(countries);

  for (i = 0; i < len_vars; i++) {
    array.push(values.slice(0 + i * len, (len - 1) + i * len));
  }

  return array;
}

function svg_element(margin, w, h) {

  // svg element
  let svg = d3.select('body')
     .append('svg')
     .attr('width', w + margin.left + margin.right)
     .attr('height', h + margin.top + margin.bottom)
     .append('g')
     .attr('transform', `translate(${margin.left},${margin.top})`);

  return svg;
}

function calculate_minmax(data) {
  bound = [];
  bound.max = Math.max.apply(Math, data);
  bound.min = Math.min.apply(Math, data);
  return bound;
}

function xScale(data) {
  bound = calculate_minmax(data);
  let x = d3.scaleLinear()
     .domain([bound.min, bound.max])
     .range([25, w - 25])
     .nice();
  return x;
}

function yScale(data) {
  bound = calculate_minmax(data);
  let y = d3.scaleLinear()
     .domain([bound.min, bound.max])
     .range([h - 25, 25])
     .nice();
  return y;
}

function range_scatter(data, ranges) {
  let range = d3.scaleLinear()
     .domain([data.min, data.max])
     .range([ranges.min, ranges.max]);
  return range;
}

function menu(options, names) {
  d3.selectAll('#menu')
     .selectAll('li')
     .data(options)
     .enter()
     .append('li')
     .text(function(d, i) {
       return names[i];
     })
     .on('click', function(d, i) {
     updateScatter(d, names[i]);
     });
}

function tooltip() {
  // tooltip adapated from Michael Stanaland’s bar bargraph
  // see http://bl.ocks.org/mstanaland/6100713 for code
  let tooltip = svg.append('g')
     .attr('class', 'tooltip')
     .style('display', 'none');
  return tooltip;
}

function legend_color(svg, x_pos, y_pos, width, color, title) {

  svg.append('g')
     .attr('class', 'legendLinear')
     .attr('transform', 'translate(' + x_pos + ', ' + y_pos + ')');

  let legendLinear = d3.legendColor()
     .shapeWidth(width)
     .orient('horizontal')
     .scale(color)
     .title("Life Satisfaction Rating");

  svg.select('.legendLinear')
     .call(legendLinear);
}

// makes a legend with dynamic sizes
function legend_size(svg, x_pos, y_pos, size) {

  svg.append("g")
    .attr("class", "legendSize")
    .attr('transform', 'translate(' + x_pos + ', ' + y_pos + ')');

  var legendSize = d3.legendSize()
    .scale(size)
    .shape('circle')
    .shapePadding(14)
    .labelOffset(30)
    .orient('horizontal')
    .title("Body Mass Index");

  svg.select(".legendSize")
    .call(legendSize);
}

function updateScatter(data, names) {

  x = xScale(data);

  // change x axis
  d3.selectAll('#xaxis')
    .transition()
    .duration(500)
    .call(d3.axisBottom(x));

  // change scatter dots
  d3.selectAll('circle')
    .transition()
    .duration(1500)
    .attr('cx', function(d, i) {
      return x(data[i]);
    });

   d3.selectAll('#xLabel')
     .text(names);

  // linear regression
  trend = findLineByLeastSquare(data, exp);

  // update line of best fit
  d3.selectAll('#trendline')
    .transition()
    .duration(1500)
    .attr("x1", function(d) { return x(trend[0]); })
    .attr("y1", function(d) { return y(trend[2]); })
    .attr("x2", function(d) { return x(trend[1]); })
    .attr("y2", function(d) { return y(trend[3]); })
}


// function adapted from https://dracoblue.net/dev/linear-least-squares-in-javascript/
// did my own linear regression in week 3, but it would take some time to adapt it in javascript
// hence I used this function
function findLineByLeastSquare(values_x, values_y) {

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    // We'll use those variables for faster read/write access.
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    // calculate the sum for each of the parts necessary.
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    // y = x * m + b
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    // We will make the x and y result line now
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    // This part I added to get the coordinates for the line
    x1 = Math.min.apply(Math, result_values_x);
    x2 = Math.max.apply(Math, result_values_x);
    y1 = Math.min.apply(Math, result_values_y);
    y2 = Math.max.apply(Math, result_values_y);

    return [x1, x2, y1, y2];
}

function regression_line(trend) {

  // plot line of best fit
  svg.append("line")
     .attr('id', 'trendline')
     .attr("x1", function(d) { return x(trend[0]); })
     .attr("y1", function(d) { return y(trend[2]); })
     .attr("x2", function(d) { return x(trend[1]); })
     .attr("y2", function(d) { return y(trend[3]); })
     .attr("stroke", "grey")
     .style('opacity', .4)
     .attr("stroke-width", 5);

}

// title in browser
function scatter(data) {

  // data in useful variables
  countries = data[0];
  console.log(countries)
  wealth = data[1];
  jobs = data[2];
  support = data[3];
  exp = data[4];
  sat = data[5];
  // extra dataset for sizes, not available in api,
  // source https://en.wikipedia.org/wiki/List_of_countries_by_body_mass_index
  bmi = [27.2, 25.3, 26.3, 27.3, 26.4, 26, 22.6, 28.1, 25.4, 26.4, 26.7, 25.8, 27.8, 27.3, 32.5, 25.9, 27.8, 26.3, 26.5, 27.3]

  // title
  d3.select('head')
     .append('title')
     .text('My scatterplot');

  // svg body element
  let margin = {top: 100, right: 50, bottom: 100, left: 300};
  w = 1200 -  margin.left - margin.right;
  h = 700 -  margin.top - margin.bottom;
  svg = svg_element(margin, w, h);

  // x and y scales
  x = xScale(wealth);
  y = yScale(exp);

  // colors for scatter
  color_range = {min: 'rgb(227,74,51)', max: 'rgb(49,163,84)'};
  size_range = {min: 5, max: 20};
  color = range_scatter(calculate_minmax(sat), color_range);
  size = range_scatter(calculate_minmax(bmi), size_range);

  // menu
  names = ['Disposable Income Household', 'Employment Rate', 'Social Support Rating'];
  options = [wealth, jobs, support];
  menu(options, names);

  // tooltip text
  tooltip = tooltip();
  // tooltip styling
  tooltip.append('text')
     .style('text-anchor', 'end')
     .style('fill', 'grey')
     .style('opacity', .2)
     .style('font-size', '30px') // make it dynamic
     .style('font-weight', '700');

  // scatter plot
  svg.selectAll('circle')
     .data(wealth)
     .enter()
     .append('circle')
     .attr('cx', function(d) {
       return x(d);
     })
     .data(exp)
     .attr('cy', function(d) {
       return y(d);
     })
     .data(sat)
     .attr('fill', function(d) {
          return color(d);
       })
     .data(bmi)
     .attr('r', function(d) {
          return size(d);
      })
     // tooltip
     .on('mouseover', function() { tooltip.style('display', null); })
     .on('mouseout', function() { tooltip.style('display', 'none'); })
     .on('mousemove', function(d, i) {
       xPos = w - w / 38;
       yPos = h - h / 35;
       tooltip.attr('transform', 'translate(' + xPos + ',' + yPos + ')');
       tooltip.select('text').text(countries[i]);
     });

  // x axis
  svg.append('g')
     .attr('id', 'xaxis')
     .attr('transform', `translate(0,${h})`)
     .call(d3.axisBottom(x));

  // y axis
  svg.append('g')
     .call(d3.axisLeft(y));

  // y label
  svg.append('text')
     .attr("class", "labelClass")
     .attr('transform', 'translate(-45,' + h / 1.5 + ')rotate(-90)')
     .text('Life Expectancy');

  // x label
  svg.append('text')
     .attr('id', 'xLabel')
     .attr("class", "labelClass")
     .style('text-anchor', 'middle')
     .attr('transform', 'translate('+ w / 2 + ',' + (h + 50) + ')')
     .text(names[0]);

  // title
  svg.append('text')
     .attr("class", "titleClass")
     .style('text-anchor', 'middle')
     .attr('transform', 'translate('+ w / 2 + ',' + -25 + ')')
     .text('Life Expectancy');

 // title
 svg.append('text')
    .attr("class", "subTitle")
    .style('text-anchor', 'middle')
    .attr('transform', 'translate('+ w / 2 + ',' + 0 + ')')
    .text('Created by Philip Oosterholt - 10192263');

  // legend, please adapt x and y pos
  legend_color(svg, -275, 325, 30, color, 'Life Satisfaction');
  legend_size(svg, -275, 425, size)

  // line of best fit
  trend = findLineByLeastSquare(data[1], data[4]);
  regression_line(trend)
}
