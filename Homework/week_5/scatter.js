// Philip Oosterholt - 10192263 - Week 5

window.onload = function() {
  data = load_data()
};

function load_data() {

  let data = 'https://stats.oecd.org/SDMX-JSON/data/BLI/AUS+CHL+FRA+DEU+GRC+HUN+ISR+ITA+JPN+MEX+NLD+POL+ESP+SWE+TUR+GBR+USA+BRA+RUS+ZAF.IW_HADI+JE_EMPL+SC_SNTWS+HS_LEB+SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions'
  let requests = [d3.json(data)];

  Promise.all(requests).then(function(response) {

    console.log(response)
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

function color_scatter(data, color_range) {
  let color = d3.scaleLinear()
     .domain([data.min, data.max])
     .range([color_range.min, color_range.max]);
  return color;
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
     .on('click', function(d) {
     updateScatter(d);
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

function legend(svg, x_pos, y_pos, width, color, title) {

  svg.append('g')
     .attr('class', 'legendLinear')
     .attr('transform', 'translate(550, 400)');

  let legendLinear = d3.legendColor()
     .shapeWidth(30)
     .orient('horizontal')
     .scale(color)
     .title(title);

  svg.select('.legendLinear')
     .call(legendLinear);
}

function updateScatter(data) {

  x = xScale(data);

  d3.selectAll('#xaxis')
     .transition()
     // .duration(1500)
     .call(d3.axisBottom(x));

  d3.selectAll('circle')
     .transition()
     .duration(1500)
     .attr('cx', function(d, i) {
       return x(data[i]);
     });
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
  // extra dataset, not available in api
  bmi = [27.2, 25.3, 26.3, 27.3, 26.4, 26, 22.6, 28.1, 25.4, 26.4, 26.7, 25.8, 27.8, 27.3, 32.5, 25.9, 27.8, 26.3, 26.5, 27.3]
  console.log(bmi.length)

  // title
  d3.select('head')
     .append('title')
     .text('My scatterplot');

  // Plot title, name, description
  d3.select('body')
     .append('h1')
     .text('Life expectancy')
     .append('h3')
     .text('Created by Philip Oosterholt, student number 10192263');

  // svg body element
  let margin = {top: 50, right: 50, bottom: 50, left: 250};
  w = 1050 -  margin.left - margin.right;
  h = 600 -  margin.top - margin.bottom;
  svg = svg_element(margin, w, h);

  // x and y scales
  x = xScale(wealth);
  y = yScale(exp);

  // colors for scatter
  color_range = {min: 'rgb(227,74,51)', max: 'rgb(49,163,84)'};
  color = color_scatter(calculate_minmax(sat), color_range);

  // menu
  names = ['Wealth', 'Employment', 'Social support'];
  options = [wealth, jobs, support];
  menu(options, names);

  // tooltip text
  tooltip = tooltip();
  // tooltip styling
  tooltip.append('text')
     .style('text-anchor', 'end')
     .style('fill', 'grey')
     .style('opacity', .2)
     .style('font-size', '42px') // make it dynamic
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
     .attr('r', 7)
     // tooltip
     .on('mouseover', function() { tooltip.style('display', null); })
     .on('mouseout', function() { tooltip.style('display', 'none'); })
     .on('mousemove', function(d, i) {
       xPos = w - w / 38;
       yPos = h - h / 35;
       tooltip.attr('transform', 'translate(' + xPos + ',' + yPos + ')');
       tooltip.select('text').text(countries[i]);
     });

  svg.append('g')
     .attr('id', 'xaxis')
     .attr('transform', `translate(0,${h})`)
     .call(d3.axisBottom(x));

  svg.append('g')
     .call(d3.axisLeft(y));

  // legend, please adapt x and y pos
  legend(svg, 550, 20, 30, color, 'title');
}
