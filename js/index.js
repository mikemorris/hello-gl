var shaders = require('../dist/shaders');

// Get WebGL context
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl', {
  antialias: false,
  alpha: true,
  stencil: true,
  depth: false
});

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, shaders.pixel.vertex);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, shaders.pixel.fragment);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);

var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

var colorLocation = gl.getUniformLocation(program, 'u_color');

var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

for (var i = 0; i < 50; i++) {
    bufferRect(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function bufferRect(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), gl.STATIC_DRAW);
}
