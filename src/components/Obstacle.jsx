import React, { useEffect } from 'react'
import { Box } from '@react-three/drei'
import { useBox, useSphere } from '@react-three/cannon'

import { OBSTACLE_GROUP } from '../constants'
import { lerp, map } from '../utils'
import { useStore } from '../useStore'

export function Obstacle({ size, color = '#2326d4', ...props }) {
  const currentPowerup = useStore((state) => state.currentPowerup)
  const [ref, api] = useBox(() => ({
    args: [size, size, size],
    mass: map(size, [1, 3], [0.1, 50]),
    rotation: [0, lerp(Math.random(), -45, 45), 0],
    collisionFilterGroup: OBSTACLE_GROUP,
    ...props,
  }))

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

      <Box args={[size * 0.75, size * 0.75, size * 0.75]} castShadow receiveShadow>
        <meshStandardMaterial wireframe wireframeLinewidth={10} color="#02022d" distance={10} />
      </Box>
    </group>
  )
}
