precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_textureSize;
varying vec2 v_texCoord;

void main() {
  vec2 pixel = vec2(1.0, 1.0) / u_textureSize;
  gl_FragColor = (
    texture2D(u_image, v_texCoord) +
    texture2D(u_image, v_texCoord + pixel) +
    texture2D(u_image, v_texCoord - pixel)) / 3.0;
}
