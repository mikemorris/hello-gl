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

loadImages([
  '/textures/leaves.jpg',
  '/textures/star.jpg'
], render);

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;

  var onImageLoad = function() {
    --imagesToLoad;
    if (imagesToLoad === 0) callback(images);
  }; 

  for (var i = 0; i < urls.length; i++) {
    var image = loadImage(urls[i], onImageLoad);
    images.push(image);
  }
}
 
function render(images) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, shaders.texture.vertex);
  gl.compileShader(vertexShader);
  var vertexSuccess = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!vertexSuccess) {
    throw "could not compile shader:" + gl.getShaderInfoLog(vertexShader);
  }

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, shaders.texture.fragment);
  gl.compileShader(fragmentShader);
  var fragmentSuccess = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!fragmentSuccess) {
    throw "could not compile shader:" + gl.getShaderInfoLog(fragmentShader);
  }

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Vertex shader
  var positionLocation = gl.getAttribLocation(program, 'a_position');
  var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

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
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Create textures and upload images into the textures.
  var textures = [];
  for (var j = 0; j < 2; j++) {
    var texture = createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[j]);
    textures.push(texture);
  }

  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  // Set texture units.
  var u_image0Location = gl.getUniformLocation(program, 'u_image0');
  var u_image1Location = gl.getUniformLocation(program, 'u_image1');

  gl.uniform1i(u_image0Location, 0);
  gl.uniform1i(u_image1Location, 1);

  // Bind textures to texture units.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  setRectangle(gl, 0, 0, images[0].width, images[0].height);

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  function createTexture(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  }

  function setRectangle(gl, x, y, width, height) {
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
       x2, y2]), gl.STATIC_DRAW);
  }
}
