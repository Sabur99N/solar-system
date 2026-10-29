export const starVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aBrightness;

uniform float uTime;
uniform float uPixelRatio;
uniform float uBrightnessScale;

varying float vBrightness;
varying float vTwinkle;

void main() {
  vBrightness = aBrightness * uBrightnessScale;
  vTwinkle = 0.88 + 0.12 * sin(uTime * 0.5 + aPhase * 6.28);

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // Fixed tiny pixel size — no distance blow-up
  gl_PointSize = max(1.0, aSize * uPixelRatio);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const starFragmentShader = /* glsl */ `
varying float vBrightness;
varying float vTwinkle;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  // Hard tiny disc — no soft glow halo
  if (d > 0.35) discard;
  float alpha = vBrightness * vTwinkle;
  vec3 color = vec3(0.85, 0.9, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

export const cometVertexShader = /* glsl */ `
attribute float aSeed;
attribute float aSpeed;
attribute float aLength;

uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;

void main() {
  float cycle = 18.0 + aSeed * 28.0;
  float t = mod(uTime * aSpeed + aSeed * cycle, cycle);
  float life = t / 2.2;
  float active = step(life, 1.0);

  vec3 dir = normalize(vec3(
    sin(aSeed * 12.3),
    -0.4 - fract(aSeed * 3.1) * 0.4,
    cos(aSeed * 7.7)
  ));
  vec3 tip = position + dir * (life * aLength) * active;

  vAlpha = active * (1.0 - life) * 0.55;

  vec4 mvPosition = modelViewMatrix * vec4(tip, 1.0);
  gl_PointSize = 2.0 * uPixelRatio * active;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const cometFragmentShader = /* glsl */ `
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.45) discard;
  float core = 1.0 - smoothstep(0.0, 0.45, d);
  gl_FragColor = vec4(0.8, 0.9, 1.0, core * vAlpha);
}
`;

export const cometTrailVertexShader = /* glsl */ `
attribute float aSeed;
attribute float aSpeed;
attribute float aLength;
attribute float aTrail;

uniform float uTime;

varying float vAlpha;

void main() {
  float cycle = 18.0 + aSeed * 28.0;
  float t = mod(uTime * aSpeed + aSeed * cycle, cycle);
  float life = t / 2.2;
  float active = step(life, 1.0);

  vec3 dir = normalize(vec3(
    sin(aSeed * 12.3),
    -0.4 - fract(aSeed * 3.1) * 0.4,
    cos(aSeed * 7.7)
  ));

  float head = life * aLength;
  float along = head - aTrail * aLength * 0.5;
  vec3 pos = position + dir * max(along, 0.0) * active;

  vAlpha = active * (1.0 - life) * (1.0 - aTrail) * 0.28;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = mix(1.8, 0.6, aTrail) * active;
  gl_Position = projectionMatrix * mv;
}
`;

export const cometTrailFragmentShader = /* glsl */ `
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float g = 1.0 - smoothstep(0.0, 0.5, d);
  gl_FragColor = vec4(0.65, 0.8, 1.0, g * vAlpha);
}
`;
