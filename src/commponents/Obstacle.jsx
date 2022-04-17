import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

import { OBSTACLE_GROUP } from '../constants'
import { lerp, map } from '../utils'

export function Obstacle({ size, ...props }) {
  const [ref, api] = useBox(() => ({
    args: [size, size, size],
    mass: map(size, [1, 3], [0.1, 50]),
    collisionFilterGroup: OBSTACLE_GROUP,
    ...props,
  }))

  useEffect(() => {
    api.applyTorque([lerp(Math.random(), -50, 50), lerp(Math.random(), -50, 50), lerp(Math.random(), -50, 50)])
  }, [])

  const lightRef = useRef(null)

  useFrame(({ clock }) => {
    lightRef.current.distance = map(Math.sin(clock.getElapsedTime() + size), [-1, 1], [0.5, size * 0.75])
  })

  return (
    <group ref={ref} uuid={props.uuid}>
      <Box args={[size, size, size]} castShadow receiveShadow>
        <meshPhongMaterial transparent opacity={0.3} color="#2326d4" emissive="#030450" shininess={1} />
      </Box>

      <pointLight ref={lightRef} intensity={10} color="#2326d4" />

      <Box args={[size * 0.75, size * 0.75, size * 0.75]} castShadow receiveShadow>
        <meshStandardMaterial wireframe wireframeLinewidth={10} color="#02022d" distance={10} />
      </Box>
    </group>
  )
}
