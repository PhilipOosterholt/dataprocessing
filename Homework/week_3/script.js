  // Philip Oosterholt - 10192263
  // Late wildcard

  function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
 		// a solution would be:

    var domain_min = domain[0];
    var domain_max = domain[1];
    var range_min = range[0];
    var range_max = range[1];

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min);
    var beta = range_max - alpha * domain_max;

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
  }

  // function to load the data from pandas
  function get_data(data, column){
    var new_data = [];
    for (var i = 0; i < Object.values(data).length; i++){
      new_data[i] = Object.values(data)[i][column];
    }
    return new_data
  }

  // function to linear transform the data
  function get_linear_data(data, linear){
    var new_data = [];
    for (var i = 0; i < data.length; i++) {
      new_data[i] = Math.round(linear(data[i]));
    }
    return new_data
  }

  // function to draw line in line graph
  function draw_line(data, ctx, position_x, width, color){

    previous_point = data[0];
    move = (width - position_x) / data.length;

    for(point in data) {
      point = data[point];

    ctx.beginPath();
    ctx.moveTo(position_x, previous_point);
    ctx.lineTo(position_x + move, point);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.stroke();
    previous_point = point;
    position_x += move;
    }
  }

  // function to draw x-axis
  function draw_xaxis(ctx, position_x, position_y, width, offset) {
    ctx.beginPath();
    ctx.moveTo(position_x, position_y);
    ctx.lineTo(width + offset, position_y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // function to draw y-axis
  function draw_yaxis(ctx, position_x, position_y, height, offset) {
    ctx.beginPath();
    ctx.moveTo(position_x, position_y);
    ctx.lineTo(position_x, height - offset);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }

  // Function to draw x part of the grid
  function x_grid(ctx, data, begin, end) {
    ctx.lineWidth = 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(data, begin);
    ctx.lineTo(data, end);
    ctx.stroke();
  }

  // Function to draw y part of the grid
  function y_grid(ctx, data, height, width, offset) {
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(offset, height - data);
    ctx.lineTo(width - 40, height - data);
    ctx.stroke();
  }

  // Function to draw x-markers on the x-axis
  function x_markers(ctx, data, y_begin) {
    ctx.beginPath();
    ctx.moveTo(data, y_begin);
    ctx.lineTo(data, y_begin + 4);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Function to draw y-markers on the y-axis
  function y_markers(ctx, data, height, x_begin) {
    ctx.beginPath();
    ctx.moveTo(x_begin, height - data);
    ctx.lineTo(x_begin + 4, height - data);
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function draw_simple(ctx, x_begin, y_begin, width, color){
    ctx.beginPath();
    ctx.moveTo(x_begin, y_begin);
    ctx.lineTo(x_begin + 50, y_begin);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  var fileName = "data.json";
  var txtFile = new XMLHttpRequest();
  txtFile.open("GET", fileName);
  txtFile.onreadystatechange = function() {
      if (txtFile.readyState === 4 && txtFile.status == 200) {
          var data = JSON.parse(txtFile.responseText);
          my_plot(data);
      }
    }

  txtFile.send();

  // plot function
  function my_plot(data) {

  // load data
  population = get_data(data, 'TotaalBevolking_4');
  twenty = get_data(data, 'k_0Tot20Jaar_5')
  fourtyfive = get_data(data, 'k_20Tot45Jaar_6');
  sixtyfive = get_data(data, 'k_45Tot65Jaar_7');
  eigthy = get_data(data, 'k_65Tot80Jaar_8');
  oldest = get_data(data, 'k_80JaarOfOuder_9')
  year = get_data(data, 'Perioden');

  var yaxis = [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000];

  // canvas
  var canvas = document.getElementById('Canvas'); // in your HTML this element appears as <canvas id="myCanvas"></canvas>
  var ctx = canvas.getContext('2d');
  canvas.width = 1000;
  var width = 800;
  var height = canvas.height = 600;

  // start position in canvas of the line graph
  var position_x = 100;
  var position_y = 50;

  // titles
  ctx.font = "20px Verdana";
  ctx.fillText("Bevolkingsgroei Nederland 1900-2017", position_x, 30);
  ctx.font = "12px Verdana";
  ctx.fillText("CBS, 2018", position_x, 50);

  // positioning the graph
  ctx.translate(0, height);
  ctx.scale(1, -1);

  // obtain linear functions
  linear = createTransform([0,17082], [50, height - position_x]);
  linear_year = createTransform([1900,2017], [position_x, width]);
  linear_million = createTransform([0,17082], [50, height - position_x]);

  // obtain data coordinates
  population = get_linear_data(population, linear);
  twenty = get_linear_data(twenty, linear);
  fourtyfive = get_linear_data(fourtyfive, linear);
  sixtyfive = get_linear_data(sixtyfive, linear);
  eigthy = get_linear_data(eigthy, linear);
  oldest = get_linear_data(oldest, linear);
  year = get_linear_data(year, linear_year);
  million = get_linear_data(yaxis, linear_million);

  // draw lines
  draw_line(population, ctx, 100, width, '#000000');
  draw_line(twenty, ctx, 100, width, '#00008b');
  draw_line(fourtyfive, ctx, 100, width, '#008000');
  draw_line(sixtyfive, ctx, 100, width, '#ff0000');
  draw_line(eigthy, ctx, 100, width, '#ff8c00');
  draw_line(oldest, ctx, 100, width, '#8b008b');

  // draw x, y axis
  draw_xaxis(ctx, position_x, position_y, width, 13)
  draw_yaxis(ctx, position_x, position_y, height, 70)

  // positioning the graph
  ctx.translate(50, height);
  ctx.scale(1, -1);

  // draw rectangle for legend
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.rect(790,100,155,133);
  ctx.stroke();

  // x-axis
  ctx.font = "12px Verdana";
  var begin = 1910;
  var x_label_offset = 15;
  for (var i = 0; i < year.length; i++) {
    ctx.fillText((begin + 10 * i), year[i*10] - x_label_offset, 575);
    x_markers(ctx, year[i*10], 543);
    x_grid(ctx, year[i*10], 76, 550);
  }

  // y-axis
  var y_label = 'miljoen';
  var y_label_offset = 25;
  for (var i = 0; i < million.length; i++) {
    ctx.fillText((2 + i * 2) + ' ' + y_label, - y_label_offset, height - million[i]);
    y_markers(ctx, million[i], height, 53);
    y_grid(ctx, million[i], height, width - 1, 50);
  }

  // legend
  names = ['Totaal', '0-20 jaar', '20-45 jaar', '45-65 jaar', '65-80 jaar', '80+ jaar'];
  color = ['#000000', '#00008b', '#008000', '#ff0000', '#ff8c00', '#8b008b'];

  for (var i = 0; i < names.length; i++){
    ctx.fillText(names[i], 865, 119 + i * 20);
    draw_simple(ctx, 800, 115 + i * 20, 8, color[i]);
  }
}
