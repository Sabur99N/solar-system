export const sunVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const sunFragmentShader = /* glsl */ `
uniform float uTime;
uniform sampler2D uTexture;
uniform vec3 uColorCore;
uniform vec3 uColorHot;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 n = normalize(vNormal);
  float t = uTime * 0.12;

  float plasma = fbm(vPosition * 1.8 + vec3(t * 0.4, t * 0.25, -t * 0.3));
  float granules = fbm(vPosition * 6.0 - vec3(t, -t * 0.5, t * 0.2));

  vec4 tex = texture2D(uTexture, vUv + vec2(plasma * 0.02, granules * 0.015));

  // Stable base luminance so bloom never drops out
  float detail = plasma * 0.25 + granules * 0.2;
  vec3 color = mix(uColorCore, uColorHot, 0.55 + detail * 0.35);
  color = mix(color, tex.rgb * 1.35, 0.5);

  vec3 worldPos = (modelMatrix * vec4(vPosition, 1.0)).xyz;
  vec3 viewDir = normalize(cameraPosition - worldPos);
  float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.2);
  color += uColorHot * rim * 1.4;

  // Keep HDR output constantly above bloom threshold
  color = max(color, vec3(1.15, 0.75, 0.25));
  color *= 1.85;

  gl_FragColor = vec4(color, 1.0);
}
`;

export const sunAtmosphereVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const sunAtmosphereFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.6);
  // Very subtle breathe — never goes dark
  float pulse = 0.92 + 0.08 * sin(uTime * 0.6);
  vec3 color = uColor * fresnel * 2.4 * pulse;
  float alpha = clamp(fresnel * 0.9 * pulse, 0.0, 0.95);
  gl_FragColor = vec4(color, alpha);
}
`;
