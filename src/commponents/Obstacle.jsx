import React, { useEffect, useRef } from 'react'
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

  return (
    <group ref={ref} uuid={props.uuid}>
      <Box args={[size, size, size]} castShadow receiveShadow>
        <meshStandardMaterial transparent opacity={0.3} color="#2326d4" emissive="#030450" shininess={1} />
      </Box>

      <Box args={[size * 0.75, size * 0.75, size * 0.75]} castShadow receiveShadow>
        <meshStandardMaterial wireframe wireframeLinewidth={10} color="#02022d" distance={10} />
      </Box>
    </group>
  )
}
