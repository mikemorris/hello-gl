var libmatrix = require('./matrix');
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
gl.shaderSource(vertexShader, shaders.varying.vertex);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, shaders.varying.fragment);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Vertex shader
var positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);

var colorLocation = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(colorLocation);

var matrixLocation = gl.getUniformLocation(program, 'u_matrix');

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
setGeometry(gl);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
setColors(gl);

drawScene();

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  var matrix = libmatrix.makeIdentity();
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -0.5, 0.5,
      0.5, 0.5,
      -0.5, -0.5,
      -0.5, -0.5,
      0.5, -0.5,
      0.5, 0.5
    ]),
    gl.STATIC_DRAW);
}

function setColors(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1
    ]),
    gl.STATIC_DRAW);
}
