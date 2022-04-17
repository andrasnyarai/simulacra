import React, { useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Box, Extrude, Text } from '@react-three/drei'
import * as THREE from 'three'

import { initialState, useStore } from '../useStore'

function Heart(props) {
  const shape = useMemo(() => {
    const heartShape = new THREE.Shape()

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
      <meshPhongMaterial color="red" />
    </Extrude>
  )
}

export function Menu() {
  const { isPlayerAlive, lives, levelColor, restart, isGameOver } = useStore((state) => state)
  const { camera } = useThree()
  const [x, , z] = camera.position

  return (
    !isPlayerAlive && (
      <group position={[x, 1, z]}>
        <Heart rotation={[Math.PI / 2, 0, 0]} scale={0.01} position={[-0.25, 0, 0.25]} />
        <Text scale={[10, 10, 10]} color="white" maxWidth={1} rotation={[-Math.PI / 2, 0, 0]}>
          {isGameOver ? '' : 'x'}
        </Text>
        <Text scale={[5, 5, 5]} color="white" rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0.75]}>
          {lives}
        </Text>

        <Box
          args={[1000, 1000, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={() => (isGameOver ? useStore.setState(initialState, true) : restart())}
        >
          <meshPhongMaterial color={levelColor} transparent opacity={0.1} />
        </Box>
      </group>
    )
  )
}
