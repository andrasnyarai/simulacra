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
