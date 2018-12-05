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
     .attr('transform', 'translate(-275, 325)');

  let legendLinear = d3.legendColor()
     .shapeWidth(30)
     .orient('horizontal')
     .scale(color)
     .title("Life Satisfaction Rating");

  svg.select('.legendLinear')
     .call(legendLinear);
}

function legend_size(svg, size) {

  d3.select("svg");

  svg.append("g")
    .attr("class", "legendSize")
    .attr("transform", "translate(-275, 425)");

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

  d3.selectAll('#xaxis')
    .transition()
    .duration(500)
    .call(d3.axisBottom(x));

  d3.selectAll('circle')
    .transition()
    .duration(1500)
    .attr('cx', function(d, i) {
      return x(data[i]);
    });

   d3.selectAll('#xLabel')
     .text(names);
}

function regression(xSeries, ySeries) {

		var reduceSumFunc = function(prev, cur) { return prev + cur; };

		var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
		var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

		var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
			.reduce(reduceSumFunc);

		var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
			.reduce(reduceSumFunc);

		var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
			.reduce(reduceSumFunc);

		var slope = ssXY / ssXX;
		var intercept = yBar - (xBar * slope);
		var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

		return [slope, intercept, rSquare];
	}

  //
  // svg.append('line')
  //     .attr('x1',x(10000))
  //     .attr('x2',x(40000))
  //     .attr('y1',y(75))
  //     .attr('y2',y(80))
  //     .attr("stroke-width", 2)
  //     .attr("stroke", "black");


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

  svg.append('g')
     .attr('id', 'xaxis')
     .attr('transform', `translate(0,${h})`)
     .call(d3.axisBottom(x));

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
  legend_color(svg, 550, 20, 30, color, 'title');
  legend_size(svg, size)

  var leastSquaresCoeff = leastSquares(xSeries, ySeries);

  // apply the reults of the least squares regression
  var x1 = xLabels[0];
  var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
  var x2 = xLabels[xLabels.length - 1];
  var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
  var trendData = [[x1,y1,x2,y2]];

  var trendline = svg.selectAll(".trendline")
    .data(trendData);

  trendline.enter()
    .append("line")
    .attr("class", "trendline")
    .attr("x1", function(d) { return xScale(d[0]); })
    .attr("y1", function(d) { return yScale(d[1]); })
    .attr("x2", function(d) { return xScale(d[2]); })
    .attr("y2", function(d) { return yScale(d[3]); })
    .attr("stroke", "black")
    .attr("stroke-width", 1);

}
