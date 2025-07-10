import React, { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Box, Extrude, Text } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'
import { Shape } from 'three'

import { useStore } from '../useStore'
import { RESPAWN_BLOCK_MS } from '../constants'

const AnimatedBox = animated(Box)

function Heart(props) {
  const shape = useMemo(() => {
    const heartShape = new Shape()

    heartShape.moveTo(25, 25)
    heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0)
    heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35)
    heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95)
    heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35)
    heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0)
    heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25)

    return heartShape
  }, [])

  const extrudeSettings = useMemo(() => ({ depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 }), [])

  return (
    <Extrude args={[shape, extrudeSettings]} {...props}>
      <meshBasicMaterial color="red" />
    </Extrude>
  )
}

export function Menu() {
  const { isPlayerAlive, levelColor, lives, isGameOver, isGameFinished, collectedStars, regeneratePalettes } = useStore((state) => state)
  const { camera } = useThree()
  const { scale } = useSpring({
    scale: isPlayerAlive ? 1 : 0,
    config: { duration: RESPAWN_BLOCK_MS },
  })
  const [x, , z] = camera.position

  if (isGameFinished) {
    return (
      <group>
        <Text scale={[2, 2, 2]} color="white" rotation={[-Math.PI / 2, 0, 0]} position={[0, 30, 0]}>
          Thanks for playing
        </Text>
        <Text scale={[2, 2, 2]} color="white" rotation={[-Math.PI / 2, 0, 0]} position={[0, 30, 1]}>
          Stars collected: {collectedStars}
        </Text>
      </group>
    )
  }

  function handleRestart() {
    if (isGameOver) {
      regeneratePalettes()
    }
  }

  return (
    <group position={[x, 40, z]} rotation={[-Math.PI / 2, 0, 0]} onClick={handleRestart}>
      {!isPlayerAlive && (
        <AnimatedBox args={[1, 0.01, 0.1]} scale={scale.to((n) => [n, 1, 1])} position={[0, 0.075, 0]}>
          <meshBasicMaterial color="white" />
        </AnimatedBox>
      )}
      <Text scale={[0.1, 0.1, 0.1]} color="white">
        {!isPlayerAlive && `planet ${levelColor}`}
      </Text>
      <group rotation={[Math.PI, 0, 0]} position={[-0.05, -0.075, 0]}>
        {!isPlayerAlive && <Heart scale={0.001} position={[-0.025, 0, 0.1]} />}
      </group>
      <Text scale={[0.1, 0.1, 0.1]} color="white" position={[0.05, -0.1, 1]}>
        {!isPlayerAlive && lives}
      </Text>

      <Box args={[100, 100, 1]}>
        <meshPhongMaterial color={levelColor} transparent opacity={0.05} />
      </Box>
    </group>
  )
}
