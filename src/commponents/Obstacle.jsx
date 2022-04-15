import React from 'react'
import { useBox } from '@react-three/cannon'
import { Box } from '@react-three/drei'

import { OBSTACLE_GROUP } from '../groups'

export function Obstacle(props) {
  const [ref, api] = useBox(() => ({ args: [1, 1, 1], mass: 0.3, collisionFilterGroup: OBSTACLE_GROUP, ...props }))

  return (
    <group ref={ref}>
      <Box args={[1, 1, 1]} castShadow receiveShadow>
        <meshPhongMaterial transparent opacity={0.7} color="#2326d4" emissive="#030450" shininess={1} />
      </Box>
      <Box args={[0.75, 0.75, 0.75]} castShadow receiveShadow>
        <meshStandardMaterial wireframe wireframeLinewidth={10} color="#02022d" />
      </Box>
    </group>
  )
}
