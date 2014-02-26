attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;

void main() {
  vec2 rotatedPosition = vec2(
      a_position.x * u_rotation.y + a_position.y * u_rotation.x,
      a_position.y * u_rotation.y - a_position.x * u_rotation.x
  );
  vec2 position = rotatedPosition + u_translation;
  vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
