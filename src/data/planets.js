/**
 * Solar System dataset — NASA / JPL approximate values.
 * Scene units are visualization-scaled (not 1:1 AU/km).
 */

export const SUN = {
  name: 'Sun',
  radius: 4.2,
  texture: './static/sun-texture.jpeg',
  description:
    'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion in its core. It radiates energy mainly as light, ultraviolet, and infrared radiation, and is by far the most important source of energy for life on Earth.',
  facts: {
    type: 'G-type main-sequence star (G2V)',
    radius: '695,700 km',
    mass: '1.989 × 10³⁰ kg',
    surfaceTemp: '5,772 K',
    age: '~4.6 billion years',
    luminosity: '3.828 × 10²⁶ W',
  },
};

/** Relative orbital period scale — higher = slower orbit in the scene */
const ORBIT_SCALE = 0.018;
/** Relative spin scale for axial rotation */
const SPIN_SCALE = 0.12;

export const PLANETS = [
  {
    id: 'mercury',
    name: 'Mercury',
    texture: './static/mercury-texture.jpeg',
    image: './static/mercury-image.png',
    orbitColor: '#9e9e9e',
    atmosphereColor: new Float32Array([0.45, 0.42, 0.38]),
    atmosphereIntensity: 0.15,
    // Visualization
    size: 0.38,
    distance: 10,
    orbitPeriodDays: 87.969,
    rotationPeriodHours: 1407.6,
    axialTilt: 0.034,
    moons: [],
    hasRings: false,
    // Facts
    description:
      'Mercury is the smallest planet in the Solar System and the closest to the Sun. Its heavily cratered surface resembles the Moon, and extreme temperature swings define its thin exosphere.',
    distanceFromSun: '57.9 million km (0.39 AU)',
    radius: '2,439.7 km',
    mass: '3.301 × 10²³ kg',
    gravity: '3.70 m/s²',
    lengthOfDay: '1,408 hours (58.6 Earth days)',
    lengthOfYear: '88 Earth days',
    temperature: '−180°C to 430°C',
    moonsCount: 0,
  },
  {
    id: 'venus',
    name: 'Venus',
    texture: './static/venus-texture.jpeg',
    image: './static/venus-image.png',
    orbitColor: '#e8c07a',
    atmosphereColor: new Float32Array([0.95, 0.75, 0.35]),
    atmosphereIntensity: 0.55,
    size: 0.95,
    distance: 14,
    orbitPeriodDays: 224.701,
    rotationPeriodHours: -5832.5, // retrograde
    axialTilt: 177.4,
    moons: [],
    hasRings: false,
    description:
      'Venus is the second planet from the Sun and Earth’s closest planetary neighbor. A thick CO₂ atmosphere creates a runaway greenhouse effect, making it the hottest planet in the Solar System.',
    distanceFromSun: '108.2 million km (0.72 AU)',
    radius: '6,051.8 km',
    mass: '4.867 × 10²⁴ kg',
    gravity: '8.87 m/s²',
    lengthOfDay: '5,832 hours (243 Earth days, retrograde)',
    lengthOfYear: '225 Earth days',
    temperature: '~464°C (surface)',
    moonsCount: 0,
  },
  {
    id: 'earth',
    name: 'Earth',
    texture: './static/earth-texture.jpeg',
    nightTexture: './static/earth-night.jpeg',
    cloudsTexture: './static/earth-clouds.jpeg',
    image: './static/earth-image.png',
    orbitColor: '#4fc3f7',
    atmosphereColor: new Float32Array([0.35, 0.6, 1.0]),
    atmosphereIntensity: 0.85,
    size: 1.0,
    distance: 19,
    orbitPeriodDays: 365.256,
    rotationPeriodHours: 23.934,
    axialTilt: 23.44,
    moons: [
      {
        name: 'Moon',
        texture: './static/moon-texture.jpeg',
        size: 0.27,
        distance: 2.2,
        orbitPeriodDays: 27.322,
        rotationPeriodHours: 655.7,
      },
    ],
    hasRings: false,
    description:
      'Earth is the third planet from the Sun and the only known world to harbor life. Oceans cover ~71% of its surface, and a protective atmosphere and magnetic field make complex life possible.',
    distanceFromSun: '149.6 million km (1 AU)',
    radius: '6,371 km',
    mass: '5.972 × 10²⁴ kg',
    gravity: '9.807 m/s²',
    lengthOfDay: '23 h 56 min',
    lengthOfYear: '365.25 days',
    temperature: '~15°C (global mean)',
    moonsCount: 1,
  },
  {
    id: 'mars',
    name: 'Mars',
    texture: './static/mars-texture.jpeg',
    image: './static/mars-image.png',
    orbitColor: '#ff7043',
    atmosphereColor: new Float32Array([0.85, 0.45, 0.25]),
    atmosphereIntensity: 0.25,
    size: 0.53,
    distance: 25,
    orbitPeriodDays: 686.98,
    rotationPeriodHours: 24.623,
    axialTilt: 25.19,
    moons: [
      { name: 'Phobos', size: 0.06, distance: 1.1, orbitPeriodDays: 0.319, color: 0xaaaaaa },
      { name: 'Deimos', size: 0.04, distance: 1.6, orbitPeriodDays: 1.263, color: 0x888888 },
    ],
    hasRings: false,
    description:
      'Mars, the Red Planet, is a cold desert world with the tallest volcano and deepest canyon in the Solar System. Polar ice and evidence of ancient water make it a prime target for exploration.',
    distanceFromSun: '227.9 million km (1.52 AU)',
    radius: '3,389.5 km',
    mass: '6.417 × 10²³ kg',
    gravity: '3.71 m/s²',
    lengthOfDay: '24 h 37 min',
    lengthOfYear: '687 Earth days',
    temperature: '~−63°C (average)',
    moonsCount: 2,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    texture: './static/jupiter-texture.jpeg',
    image: './static/jupiter-image.png',
    orbitColor: '#bf8b7a',
    atmosphereColor: new Float32Array([0.85, 0.7, 0.55]),
    atmosphereIntensity: 0.4,
    size: 3.2,
    distance: 42,
    orbitPeriodDays: 4332.59,
    rotationPeriodHours: 9.925,
    axialTilt: 3.13,
    moons: [
      { name: 'Io', size: 0.18, distance: 4.2, orbitPeriodDays: 1.769, color: 0xf4d03f },
      { name: 'Europa', size: 0.16, distance: 5.0, orbitPeriodDays: 3.551, color: 0xd5dbdb },
      { name: 'Ganymede', size: 0.22, distance: 5.9, orbitPeriodDays: 7.155, color: 0xaab7b8 },
      { name: 'Callisto', size: 0.2, distance: 6.9, orbitPeriodDays: 16.689, color: 0x7f8c8d },
    ],
    hasRings: false,
    description:
      'Jupiter is the largest planet in the Solar System — a gas giant with a mass greater than all other planets combined. Its Great Red Spot is a centuries-old anticyclonic storm.',
    distanceFromSun: '778.5 million km (5.20 AU)',
    radius: '69,911 km',
    mass: '1.898 × 10²⁷ kg',
    gravity: '24.79 m/s²',
    lengthOfDay: '9 h 56 min',
    lengthOfYear: '11.86 Earth years',
    temperature: '~−108°C (cloud tops)',
    moonsCount: 95,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    texture: './static/satrun-texxture.jpeg',
    ringTexture: './static/satrun-ring.png',
    image: './static/saturn-image.png',
    orbitColor: '#eaac02',
    atmosphereColor: new Float32Array([0.9, 0.8, 0.55]),
    atmosphereIntensity: 0.35,
    size: 2.7,
    distance: 56,
    orbitPeriodDays: 10759.22,
    rotationPeriodHours: 10.656,
    axialTilt: 26.73,
    moons: [
      { name: 'Titan', size: 0.22, distance: 4.8, orbitPeriodDays: 15.945, color: 0xd4a574 },
      { name: 'Rhea', size: 0.1, distance: 3.8, orbitPeriodDays: 4.518, color: 0xcccccc },
      { name: 'Enceladus', size: 0.08, distance: 3.2, orbitPeriodDays: 1.37, color: 0xeeeeee },
    ],
    hasRings: true,
    ringInner: 1.35,
    ringOuter: 2.35,
    description:
      'Saturn is famed for its spectacular ring system of ice and rock. A low-density gas giant, it would float in water if a bathtub large enough existed.',
    distanceFromSun: '1.43 billion km (9.58 AU)',
    radius: '58,232 km',
    mass: '5.683 × 10²⁶ kg',
    gravity: '10.44 m/s²',
    lengthOfDay: '10 h 39 min',
    lengthOfYear: '29.46 Earth years',
    temperature: '~−139°C (cloud tops)',
    moonsCount: 146,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    texture: './static/uranus-texture.jpeg',
    image: './static/uranus-image.png',
    orbitColor: '#18dcf2',
    atmosphereColor: new Float32Array([0.45, 0.85, 0.9]),
    atmosphereIntensity: 0.5,
    size: 1.7,
    distance: 70,
    orbitPeriodDays: 30688.5,
    rotationPeriodHours: -17.24, // retrograde
    axialTilt: 97.77, // rolls on its side
    moons: [
      { name: 'Titania', size: 0.1, distance: 2.8, orbitPeriodDays: 8.706, color: 0xb0c4de },
      { name: 'Oberon', size: 0.09, distance: 3.3, orbitPeriodDays: 13.46, color: 0x9ab0c0 },
    ],
    hasRings: true,
    ringInner: 1.4,
    ringOuter: 1.85,
    description:
      'Uranus is an ice giant tilted nearly 98°, so it essentially orbits the Sun on its side. Methane in its atmosphere gives it a pale cyan hue.',
    distanceFromSun: '2.87 billion km (19.2 AU)',
    radius: '25,362 km',
    mass: '8.681 × 10²⁵ kg',
    gravity: '8.69 m/s²',
    lengthOfDay: '17 h 14 min (retrograde)',
    lengthOfYear: '84 Earth years',
    temperature: '~−195°C',
    moonsCount: 28,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    texture: './static/neptune-texture.jpeg',
    image: './static/neptune-image.png',
    orbitColor: '#2754db',
    atmosphereColor: new Float32Array([0.25, 0.4, 0.95]),
    atmosphereIntensity: 0.55,
    size: 1.65,
    distance: 84,
    orbitPeriodDays: 60182,
    rotationPeriodHours: 16.11,
    axialTilt: 28.32,
    moons: [
      { name: 'Triton', size: 0.14, distance: 3.0, orbitPeriodDays: -5.877, color: 0xd0d8e0 },
    ],
    hasRings: true,
    ringInner: 1.35,
    ringOuter: 1.7,
    description:
      'Neptune is the farthest known major planet from the Sun. Supersonic winds and dark storms mark this deep-blue ice giant, discovered via mathematical prediction in 1846.',
    distanceFromSun: '4.50 billion km (30.1 AU)',
    radius: '24,622 km',
    mass: '1.024 × 10²⁶ kg',
    gravity: '11.15 m/s²',
    lengthOfDay: '16 h 6 min',
    lengthOfYear: '164.8 Earth years',
    temperature: '~−201°C',
    moonsCount: 16,
  },
];

/** Convert real orbital/rotation periods into scene angular speeds (rad/s) */
export function orbitalSpeed(orbitPeriodDays) {
  return (Math.PI * 2) / (orbitPeriodDays * ORBIT_SCALE);
}

export function spinSpeed(rotationPeriodHours) {
  if (!rotationPeriodHours) return 0;
  const abs = Math.abs(rotationPeriodHours);
  const sign = rotationPeriodHours < 0 ? -1 : 1;
  return sign * ((Math.PI * 2) / (abs * SPIN_SCALE));
}

export const ASTEROID_BELT = {
  inner: 30,
  outer: 36,
  count: 3500,
};

export const KUIPER_BELT = {
  inner: 92,
  outer: 110,
  count: 2000,
};
