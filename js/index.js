var shaders = require('../dist/shaders');
var libmatrix = require('./matrix');

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

var image = new Image();
image.src = '/textures/leaves.jpg';
image.onload = function() {
  render(image);
}
 
function render(image) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, shaders.texture.vertex);
  gl.compileShader(vertexShader);

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, shaders.texture.fragment);
  gl.compileShader(fragmentShader);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Vertex shader
  var positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);

  var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  gl.enableVertexAttribArray(texCoordLocation);

  var matrixLocation = gl.getUniformLocation(program, 'u_matrix');

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  setGeometry(gl);

  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  drawScene();

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var matrix = libmatrix.make2DProjection(canvas.width, canvas.height);
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function setGeometry(gl) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 0,
        240, 0,
        0, 180,
        0, 180,
        240, 0,
        240, 180
      ]),
      gl.STATIC_DRAW);
  }
}
