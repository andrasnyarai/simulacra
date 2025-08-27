import React, { useEffect, useRef } from 'react'
import { Box } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { animated, useSpring, to as springTo } from '@react-spring/three'

import { OBSTACLE_GROUP } from '../constants'
import { lerp, map } from '../utils'
import { useStore } from '../useStore'

function lerpColor(a, b, t) {
  // a, b: [r, g, b] in 0-1
  // t: 0-1
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

function hexToRgbNorm(hex) {
  // hex: '#rrggbb' or '#rgb'
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16)
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ]
}

export function Obstacle({ size, color = '#2326d4', ...props }) {
  const currentPowerup = useStore((state) => state.currentPowerup)
  const [ref, api] = useBox(() => ({
    args: [size, size, size],
    mass: map(size, [1, 3], [0.1, 50]),
    rotation: [0, lerp(Math.random(), -45, 45), 0],
    collisionFilterGroup: OBSTACLE_GROUP,
    ...props,
  }))

  // Assign a stable random delay for each obstacle
  const randomDelay = useRef(Math.random() * 2000).current

  // Animate a pulse value with useSpring
  const { pulse } = useSpring({
    from: { pulse: 0 },
    to: async (next) => {
      while (1) {
        await next({ pulse: 1 })
        await next({ pulse: 0 })
      }
    },
    config: { duration: 2000 },
    reset: false,
    delay: randomDelay,
  })

  // Interpolate between deep blue and vibrant blue
  const deepBlue = [0, 0.13, 0.4]
  const vibrantBlue = [0, 0.66, 1]
  const animatedColor = springTo(pulse, (p) => {
    const [r, g, b] = lerpColor(deepBlue, vibrantBlue, p)
    return `rgb(${Math.floor(r*255)},${Math.floor(g*255)},${Math.floor(b*255)})`
  })

  useEffect(() => {
    if (currentPowerup?.type === 'Cleaner') {
      // Remove FLOOR_GROUP from collisionFilterGroup
      api.collisionFilterGroup.set(0)
    }
  }, [currentPowerup, api])

  return (
    <group ref={ref} uuid={props.uuid}>
      <Box args={[size, size, size]} castShadow receiveShadow>
        <meshStandardMaterial transparent opacity={0.3} color={color} emissive="#030450" shininess={1} />
      </Box>

      {/* Wireframe glow pulses from base color to white */}
      <mesh args={[]} position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.75, size * 0.75, size * 0.75]} />
        <animated.meshBasicMaterial
          wireframe
          color={animatedColor}
          opacity={1}
        />
      </mesh>
    </group>
  )
}
