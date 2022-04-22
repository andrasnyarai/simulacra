import React from 'react'
import { useThree } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'

import { initialState, useStore, allStarCount } from '../useStore'

export function Menu() {
  const { isPlayerAlive, levelColor, restart, isGameOver, isGameFinished, collectedStars } = useStore((state) => state)
  const { camera } = useThree()
  const [x, , z] = camera.position

  if (isGameFinished) {
    return (
      <>
        <Text scale={[5, 5, 5]} color="white" rotation={[-Math.PI / 2, 0, 0]} position={[0, 30, 0]}>
          Thanks for playing
        </Text>
        <Text scale={[5, 5, 5]} color="white" rotation={[-Math.PI / 2, 0, 0]} position={[0, 30, 1]}>
          {collectedStars}/{allStarCount}
        </Text>
      </>
    )
  }

  return (
    <group position={[x, 40, z]}>
      <Text scale={[1, 1, 1]} color="white" rotation={[-Math.PI / 2, 0, 0]}>
        {isGameOver || isPlayerAlive ? '' : 'x'}
      </Text>

      <Box
        args={[100, 100, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={() => {
          if (isPlayerAlive) return
          isGameOver ? useStore.setState(initialState, true) : restart()
        }}
      >
        <meshPhongMaterial color={levelColor} transparent opacity={0.1} />
      </Box>
    </group>
  )
}
