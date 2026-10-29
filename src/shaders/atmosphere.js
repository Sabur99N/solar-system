export const atmosphereVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const atmosphereFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform vec3 uLightPos;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 lightDir = normalize(uLightPos - vWorldPos);

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8);
  float scatter = pow(max(dot(normal, lightDir), 0.0), 0.65);

  float alpha = fresnel * scatter * uIntensity;
  vec3 color = uColor * (fresnel * 1.6 + scatter * 0.4);

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.85));
}
`;

export const earthVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const earthFragmentShader = /* glsl */ `
uniform sampler2D uDayMap;
uniform sampler2D uNightMap;
uniform sampler2D uCloudMap;
uniform float uTime;
uniform vec3 uLightPos;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightPos - vWorldPos);

  float NdotL = dot(normal, lightDir);
  float dayFactor = smoothstep(-0.15, 0.35, NdotL);

  vec3 day = texture2D(uDayMap, vUv).rgb;
  vec3 night = texture2D(uNightMap, vUv).rgb * 1.8;
  vec3 surface = mix(night, day, dayFactor);

  // Clouds drift slowly
  vec2 cloudUv = vUv + vec2(uTime * 0.008, 0.0);
  float clouds = texture2D(uCloudMap, cloudUv).r;
  surface = mix(surface, vec3(1.0), clouds * 0.45 * dayFactor);

  // Specular ocean hint
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 48.0) * dayFactor * (1.0 - clouds);
  surface += vec3(0.4, 0.55, 0.8) * spec * 0.35;

  gl_FragColor = vec4(surface, 1.0);
}
`;

export const ringVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const ringFragmentShader = /* glsl */ `
uniform sampler2D uRingMap;
uniform vec3 uColor;
uniform float uInner;
uniform float uOuter;
uniform vec3 uLightPos;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  // RingGeometry UV: u along circumference, v radial (0=inner, 1=outer)
  float radial = vUv.y;
  vec4 ringTex = texture2D(uRingMap, vec2(radial, 0.5));

  float alpha = ringTex.a;
  if (alpha < 0.02) alpha = smoothstep(0.0, 0.08, radial) * smoothstep(1.0, 0.85, radial);
  alpha *= (0.35 + ringTex.r * 0.65) * uOpacity;

  // Cassini-division-like gap
  float gap = smoothstep(0.42, 0.45, radial) * (1.0 - smoothstep(0.48, 0.52, radial));
  alpha *= 1.0 - gap * 0.85;

  vec3 lightDir = normalize(uLightPos - vWorldPos);
  float lit = 0.55 + 0.45 * max(dot(vec3(0.0, 1.0, 0.0), lightDir), 0.0);

  vec3 color = mix(uColor, ringTex.rgb, 0.5) * lit;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
}
`;
