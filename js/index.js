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

  // Create texture and upload the image into the texture.
  var originalImageTexture = createTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  var textures = [];
  var framebuffers = [];
  for (var i = 0; i < 2; i++) {
    var texture = createTexture(gl);
    textures.push(texture);

    // Make each texture same size as image.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  var textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');
  var kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
  var flipYLocation = gl.getUniformLocation(program, 'u_flipY');

  gl.uniform2f(textureSizeLocation, image.width, image.height);

  // Define several convolution kernels
  var kernels = {
    normal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ],
    unsharpen: [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1
    ],
    emboss: [
       -2, -1,  0,
       -1,  1,  1,
        0,  1,  2
    ],
    edgeDetect: [
      -1, -1, -1,
      -1, 8, -1,
      -1, -1, -1
    ]
  };
 
  // List of effects to apply.
  var effectsToApply = Object.keys(kernels);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  setRectangle(gl, 0, 0, image.width, image.height);

  drawEffects();

  function drawEffects() {
    // Start with the original image.
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    // Don't Y flip image while drawing to textures.
    gl.uniform1f(flipYLocation, 1);
    
    // Loop through each effect.
    for (var j = 0; j < effectsToApply.length; j++) {
      // Setup to draw into a framebuffer.
      setFramebuffer(framebuffers[j%2], image.width, image.height);

      drawWithKernel(effectsToApply[j]);

      // Alternate textures.
      gl.bindTexture(gl.TEXTURE_2D, textures[j%2]);
    }

    // Draw to canvas.
    gl.uniform1f(flipYLocation, -1);
    setFramebuffer(null, canvas.width, canvas.height);
    drawWithKernel('normal');
  }

  function setFramebuffer(fbo, width, height) {
    // Make this the active framebuffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Tell the shader the resolution of the framebuffer.
    gl.uniform2f(resolutionLocation, width, height);

    // Tell WebGL the viewport needed for the framebuffer.
    gl.viewport(0, 0, width, height);
  }

  function drawWithKernel(name) {
    // Set kernel.
    gl.uniform1fv(kernelLocation, kernels[name]);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
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
