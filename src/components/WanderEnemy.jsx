import React from 'react'
import { useFrame } from '@react-three/fiber'
import { Icosahedron, MeshWobbleMaterial } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'

import { lerp } from '../utils'
import { ENEMY_MATERIAL, ENEMY_GROUP, ENEMY_MOVEMENT_SPEED } from '../constants'

const movementBound = 7 * ENEMY_MOVEMENT_SPEED

export function WanderEnemy(props) {
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 1,
    ...props,
    material: ENEMY_MATERIAL,
    collisionFilterGroup: ENEMY_GROUP,
  }))

  useFrame(({ clock }) => {
    if (clock.elapsedTime % Math.random() < 0.01) {
      api.applyTorque([lerp(Math.random(), -20, 20), lerp(Math.random(), -20, 20), lerp(Math.random(), -20, 20)])

      api.velocity.set(lerp(Math.random(), -movementBound, movementBound), 0, lerp(Math.random(), -movementBound, movementBound))
    }
  })

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <Icosahedron args={[0.4, 0]} castShadow receiveShadow>
        <MeshWobbleMaterial color="red" speed={5} factor={5} />
      </Icosahedron>
    </group>
  )
}
