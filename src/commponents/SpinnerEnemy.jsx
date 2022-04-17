import React from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshWobbleMaterial, Octahedron } from '@react-three/drei'
import { useSphere, useSpring } from '@react-three/cannon'
import { animated } from '@react-spring/three'

import { ENEMY_GROUP, ENEMY_MOVEMENT_SPEED } from '../constants'
import { lerp } from '../utils'

const movementBound = 15 * ENEMY_MOVEMENT_SPEED
const movementBoundCore = 25 * ENEMY_MOVEMENT_SPEED

export const SpinnerEnemy = (props) => {
  const [spinnerCoreRef, spinnerCoreApi] = useSphere(() => ({
    args: [0.5],
    linearDamping: 0.9,
    mass: 100,
    collisionFilterGroup: ENEMY_GROUP,
    ...props,
  }))

  const [spinnerRef, spinnerApi] = useSphere(() => ({
    args: [0.5],
    mass: 10,
    collisionFilterGroup: ENEMY_GROUP,
    ...props,
  }))

  const [, , api] = useSpring(spinnerCoreRef, spinnerRef, { damping: 100, restLength: 1, stiffness: 1000 })

  useFrame(({ clock }) => {
    if (clock.elapsedTime % Math.random() < 0.01) {
      api.setRestLength(lerp(Math.random(), 1, 4))

      spinnerApi.rotation.set(lerp(Math.random(), -movementBound, movementBound), 0, lerp(Math.random(), -movementBound, movementBound))
      spinnerApi.rotation.set(lerp(Math.random(), -movementBound, movementBound), 0, lerp(Math.random(), -movementBound, movementBound))

      spinnerCoreApi.rotation.set(
        lerp(Math.random(), -movementBoundCore, movementBoundCore),
        0,
        lerp(Math.random(), -movementBoundCore, movementBoundCore)
      )
      spinnerCoreApi.velocity.set(
        lerp(Math.random(), -movementBoundCore, movementBoundCore),
        0,
        lerp(Math.random(), -movementBoundCore, movementBoundCore)
      )
    }
  })

  return (
    <group>
      <Octahedron args={[0.5, 0]} ref={spinnerCoreRef} uuid={props.coreUuid}>
        <MeshWobbleMaterial color="red" speed={5} factor={50} />
        <animated.pointLight
          position={[0, 0.5, 0]}
          intensity={5}
          color="red"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={10}
        />
      </Octahedron>

      <Octahedron args={[0.5, 0]} ref={spinnerRef} uuid={props.uuid}>
        <MeshWobbleMaterial color="red" speed={5} factor={50} />
        <animated.pointLight
          position={[0, 0.5, 0]}
          intensity={5}
          color="red"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={10}
        />
      </Octahedron>
    </group>
  )
}
