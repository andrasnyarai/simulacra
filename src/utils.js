import { useRef, useEffect } from 'react'

export function isMobile() {
  return /(iPhone|iPod|iPad|Android|BlackBerry)/gi.test(window.navigator.userAgent)
}

export function lerp(alpha, min, max) {
  return min * (1 - alpha) + max * alpha
}

export function map(value, [minFrom, maxFrom], [minTo, maxTo]) {
  return ((value - minFrom) * (maxTo - minTo)) / (maxFrom - minFrom) + minTo
}

function getDistanceBetweenPoints(a, b) {
  return Math.sqrt((a.z - b.z) ** 2 + (a.x - b.x) ** 2)
}

export function calculateStartingPosition(mapWidth, mapHeight, offsetFromCenter, offsetFromEdge = 3) {
  const width = mapWidth - offsetFromEdge
  const height = mapHeight - offsetFromEdge
  let x = lerp(Math.random(), -width / 2, width / 2)
  let z = lerp(Math.random(), -height / 2, height / 2)

  while (-offsetFromCenter < x && x < offsetFromCenter && -offsetFromCenter < z && z < offsetFromCenter) {
    x = lerp(Math.random(), -width / 2, width / 2)
  }

  return { x, z }
}

/**
 * Calculates random, non-overlapping positions and sizes for obstacles and stars on a map.
 * Obstacles are placed first, ensuring they do not overlap with each other.
 * Stars are then placed, ensuring they do not overlap with each other or with any obstacle.
 * Returns an array of objects (obstacles and stars) with assigned positions and sizes.
 */
export function calculateNonOverlappingPositions(objectDefinitions, mapWidth, mapHeight) {
  const obstacleDefinitions = objectDefinitions.filter(({ type }) => type === 'OBSTACLE')
  const obstaclePositions = []
  while (obstaclePositions.length < obstacleDefinitions.length) {
    const size = lerp(Math.random(), 1, 3)
    const radius = Math.sqrt(size ** 2 + size ** 2) / 2
    const position = calculateStartingPosition(mapWidth, mapHeight, 3, Math.sqrt(size ** 2 + size ** 2))

    const isOverlapping = obstaclePositions.some((a) => getDistanceBetweenPoints(a.position, position) < a.radius + radius)
    if (!isOverlapping) {
      obstaclePositions.push({ position, size, radius })
    }
  }

  const starDefinitions = objectDefinitions.filter(({ type }) => type === 'STAR')
  const starPositions = []
  while (starPositions.length < starDefinitions.length) {
    const size = 0.4
    const radius = size
    const position = calculateStartingPosition(mapWidth, mapHeight, 3, 1)

    const isOverlapping =
      starPositions.some((a) => getDistanceBetweenPoints(a.position, position) < radius * 2) ||
      obstaclePositions.some((a) => getDistanceBetweenPoints(a.position, position) < a.radius + radius)
    if (!isOverlapping) {
      starPositions.push({ position, size })
    }
  }

  return obstacleDefinitions
    .map((rest, i) => ({ ...rest, position: obstaclePositions[i].position, size: obstaclePositions[i].size }))
    .concat(starDefinitions.map((rest, i) => ({ ...rest, position: starPositions[i].position, size: starPositions[i].size })))
}

export function useKeyPress(targetKey) {
  const keyPressed = useRef(false)

  function downHandler({ key }) {
    if (key === targetKey) {
      keyPressed.current = true
    }
  }
  const upHandler = ({ key }) => {
    if (key === targetKey) {
      keyPressed.current = false
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])
  return keyPressed
}

/**
 * Runs the enemy explosion animation sequence using a react-spring API.
 * @param {SpringApi} api - The spring API from useSpring.
 * @param {string} color - The base color to reset to.
 * @param {string} [flashColor] - The color to flash at the start of the explosion (default: white).
 * @returns {Promise<void>}
 */
export async function runExplosionSpring(api, color, flashColor = '#fff') {
  await api.start({ color: flashColor, emissive: flashColor, emissiveIntensity: 2, config: { duration: 200 } });
  await api.start({ opacity: 0,  config: { duration: 200 } });
}

// Generate a visually distinct random color
export function randomColor({s=70, l=55, hRange=[0,360]} = {}) {
  // HSL to hex
  const h = Math.floor(Math.random() * (hRange[1] - hRange[0]) + hRange[0])
  return hslToHex(h, s, l)
}

export function randomDarkColor() {
  // Lower lightness, full saturation
  return randomColor({ s: 60 + Math.random() * 20, l: 12 + Math.random() * 18 })
}

export function randomNeonColor() {
  // High saturation, mid-high lightness
  return randomColor({ s: 90 + Math.random() * 10, l: 50 + Math.random() * 10 })
}

export function randomPastelColor() {
  // Lower saturation, high lightness
  return randomColor({ s: 40 + Math.random() * 20, l: 70 + Math.random() * 10 })
}

export function randomWhiteYellowColor() {
  // H: 40-60 (yellow) or 0-40 (white to yellow), high lightness
  const h = Math.random() < 0.5 ? Math.floor(Math.random() * 40) : 40 + Math.floor(Math.random() * 20)
  return randomColor({ hRange: [h, h+1], s: 20 + Math.random() * 30, l: 85 + Math.random() * 10 })
}

export function randomBluishColor() {
  // H: 200-250 (blue/cyan), moderate to high saturation
  return randomColor({ hRange: [200, 250], s: 60 + Math.random() * 30, l: 40 + Math.random() * 20 })
}

export function randomReddishColor() {
  // Focus on pure red colors - narrower hue range for redder appearance
  // H: 0-15 (pure red), 350-360 (magenta-red)
  let h;
  const roll = Math.random();
  if (roll < 0.8) {
    h = Math.floor(Math.random() * 15); // 0-14: pure red
  } else {
    h = 350 + Math.floor(Math.random() * 10); // 350-359: magenta-red
  }
  return randomColor({ hRange: [h, h+1], s: 80 + Math.random() * 20, l: 45 + Math.random() * 20 });
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
