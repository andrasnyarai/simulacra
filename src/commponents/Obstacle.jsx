import React from 'react'
import { useBox } from '@react-three/cannon'
import { Box } from '@react-three/drei'

import { OBSTACLE_GROUP } from '../groups'

export function Obstacle(props) {
  const [ref, api] = useBox(() => ({ args: [1, 1, 1], mass: 0.3, collisionFilterGroup: OBSTACLE_GROUP, ...props }))

  return (
    <Box args={[1]} ref={ref} castShadow receiveShadow>
      <meshPhongMaterial color="#2326d4" emissive="#030450" shininess={1} />
    </Box>
  )
}
