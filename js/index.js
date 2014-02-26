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

var translationLocation = gl.getUniformLocation(program, 'u_translation');
var translation = [
    randomInt(canvas.width - 100),
    randomInt(canvas.height - 150)
];

var rotationLocation = gl.getUniformLocation(program, 'u_rotation');
var angleInDegrees = -30;
var angleInRadians = angleInDegrees * Math.PI / 180;
var rotation = [
    Math.sin(angleInRadians),
    Math.cos(angleInRadians)
];

var colorLocation = gl.getUniformLocation(program, 'u_color');

var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

setGeometry(gl);

drawScene();

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2fv(translationLocation, translation);
    gl.uniform2fv(rotationLocation, rotation);
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 18);
}

function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,
   
            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,
   
            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90]),
        gl.STATIC_DRAW);
}
