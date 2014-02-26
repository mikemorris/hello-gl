attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_flipY;

varying vec2 v_texCoord;

void main() {
  vec2 position = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(position * vec2(1, u_flipY), 0, 1);

  // GPU will interpolate between points
  v_texCoord = a_texCoord;
}
