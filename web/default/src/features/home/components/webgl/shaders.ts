export const grainVS = `#version 300 es
in vec2 a_position;
out vec2 v_objectUV;
void main() {
  gl_Position = vec4(a_position, 0, 1);
  v_objectUV = a_position * 0.5;
}`

export const grainFS = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_colorBack;
uniform vec4 u_colors[3];
uniform float u_colorsCount;
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;

in vec2 v_objectUV;
out vec4 fragColor;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

mat2 rotate(float a) { float c=cos(a),s=sin(a); return mat2(c,s,-s,c); }
vec2 rotateV(vec2 v, float a) { return rotate(a) * v; }

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float randomR(vec2 st) {
  st = mod(st, 100.0);
  return fract(sin(dot(st, vec2(127.1, 311.7))) * 43758.5453);
}
float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbmR(vec2 n) {
  float amplitude = 0.2;
  float total = 0.0;
  for (int i = 0; i < 3; i++) {
    n = rotateV(n, 0.3);
    total += valueNoiseR(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

void main() {
  float t = 0.1 * (u_time + 7.0);
  float objectBoxSize = min(u_resolution.x, u_resolution.y);
  vec2 shape_uv = v_objectUV * u_resolution / objectBoxSize;
  vec2 grain_uv = v_objectUV * u_resolution * 0.7;

  shape_uv *= 0.6;
  vec2 outer = vec2(0.5);
  vec2 bl = smoothstep(vec2(0.0), outer, shape_uv + vec2(0.1 + 0.1*sin(3.0*t), 0.2 - 0.1*sin(5.25*t)));
  vec2 tr = smoothstep(vec2(0.0), outer, 1.0 - shape_uv);
  float shape = 1.0 - bl.x * bl.y * tr.x * tr.y;

  shape_uv = -shape_uv;
  bl = smoothstep(vec2(0.0), outer, shape_uv + vec2(0.1 + 0.1*sin(3.0*t), 0.2 - 0.1*cos(5.25*t)));
  tr = smoothstep(vec2(0.0), outer, 1.0 - shape_uv);
  shape -= bl.x * bl.y * tr.x * tr.y;
  shape = 1.0 - smoothstep(0.0, 1.0, shape);

  float baseNoise = snoise(grain_uv * 0.5);
  float fbmX = fbmR(0.002 * grain_uv + 10.0);
  float fbmY = fbmR(0.003 * grain_uv);
  float fbmZ = fbmR(0.001 * grain_uv) + fbmR(rotateV(0.4 * grain_uv, 2.0));
  float grainDist = baseNoise * snoise(grain_uv * 0.2) - fbmX - fbmY;
  float rawNoise = 0.75 * baseNoise - fbmZ;
  float noiseVal = clamp(rawNoise, 0.0, 1.0);

  shape += u_intensity * 2.0 / u_colorsCount * (grainDist + 0.5);
  shape += u_noise * 10.0 / u_colorsCount * noiseVal;

  float aa = fwidth(shape);
  shape = clamp(shape - 0.5 / u_colorsCount, 0.0, 1.0);
  float totalShape = smoothstep(0.0, u_softness + 2.0*aa, clamp(shape * u_colorsCount, 0.0, 1.0));
  float mixer = shape * (u_colorsCount - 1.0);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < 3; i++) {
    float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
    localT = smoothstep(0.5 - 0.5*u_softness - aa, 0.5 + 0.5*u_softness + aa, localT);
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * totalShape;
  float opacity = gradient.a * totalShape;
  color += u_colorBack.rgb * u_colorBack.a * (1.0 - opacity);
  opacity += u_colorBack.a * (1.0 - opacity);
  fragColor = vec4(color, opacity);
}`

export const ditherVS = grainVS

export const ditherFS = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_scale;
uniform float u_pxSize;
uniform float u_time;

out vec4 fragColor;

const int bayer4x4[16] = int[16](0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5);

void main() {
  float t = 0.5 * u_time;
  float pxSize = u_pxSize;
  vec2 pxSizeUV = gl_FragCoord.xy / pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + 0.5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;
  vec2 shapeUV = normalizedUV - 0.5;

  float objectBoxSize = min(u_resolution.x, u_resolution.y);
  vec2 objectWorldScale = u_resolution.xy / vec2(objectBoxSize);
  shapeUV *= objectWorldScale;
  shapeUV /= u_scale;

  shapeUV *= 2.0;
  float d = 1.0 - dot(shapeUV, shapeUV);
  vec3 pos = vec3(shapeUV, sqrt(max(0.0, d)));
  vec3 lightPos = normalize(vec3(cos(1.5*t), 0.8, sin(1.25*t)));
  float shape = (0.5 + 0.5 * dot(lightPos, pos)) * step(0.0, d);

  ivec2 bpos = ivec2(mod(pxSizeUV, 4.0));
  float dithering = float(bayer4x4[bpos.y * 4 + bpos.x]) / 16.0 - 0.5;
  float res = step(0.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;
  vec3 color = fgColor * res + bgColor * (1.0 - fgOpacity * res);
  float opacity = fgOpacity * res + bgOpacity * (1.0 - fgOpacity * res);
  fragColor = vec4(color, opacity);
}`
