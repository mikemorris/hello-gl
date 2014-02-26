attribute vec2 a_position;
uniform mat3 u_matrix;
varying vec4 v_color;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // Clipspace -1.0 to 1.0, colorspace 0.0 to 1.0
  v_color = gl_Position * 0.5 + 0.5;
}
