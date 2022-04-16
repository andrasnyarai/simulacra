import React from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshWobbleMaterial, Sphere } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'

import { ENEMY_GROUP } from '../groups'
import { lerp } from '../utils'
import { enemyMaterial } from '../materials'

export function WanderEnemy(props) {
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 1,
    ...props,
    material: enemyMaterial,
    collisionFilterGroup: ENEMY_GROUP,
  }))

  useFrame(({ clock }) => {
    if (clock.elapsedTime % Math.random() < 0.01) {
      api.applyTorque([lerp(Math.random(), -20, 20), lerp(Math.random(), -20, 20), lerp(Math.random(), -20, 20)])
      api.velocity.set(lerp(Math.random(), -7, 7), 0, lerp(Math.random(), -7, 7))
    }
  })

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <Sphere args={[0.4]} castShadow receiveShadow>
        <MeshWobbleMaterial color="red" speed={5} factor={50} />
        <pointLight
          position={[-0.75, 0, 0]}
          intensity={1}
          color="red"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={2}
          decay={2}
        />
        <pointLight
          position={[0.75, 0, 0]}
          intensity={1}
          color="red"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={2}
          decay={2}
        />
      </Sphere>
    </group>
  )
}
