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

export function calculateStartingPosition(mapWidth, mapHeight, startOffset) {
  const offset = 2.5
  const width = mapWidth - offset
  const height = mapHeight - offset
  let x = lerp(Math.random(), -width / 2, width / 2)
  let z = lerp(Math.random(), -height / 2, height / 2)

  while (-startOffset < x && x < startOffset && -startOffset < z && z < startOffset) {
    x = lerp(Math.random(), -width / 2, width / 2)
  }

  return { x, z }
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
