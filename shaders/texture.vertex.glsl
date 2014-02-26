attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform mat3 u_matrix;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // GPU will interpolate between points
  v_texCoord = a_texCoord;
}