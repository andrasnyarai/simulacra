import React, { useEffect } from 'react'
import { useSphere } from '@react-three/cannon'
import { MeshWobbleMaterial, Sphere } from '@react-three/drei'

import { ENEMY_GROUP } from '../groups'
import { lerp } from '../utils'
import { enemyMaterial } from '../materials'

export function Enemy(props) {
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 1,
    ...props,
    material: enemyMaterial,
    collisionFilterGroup: ENEMY_GROUP,
  }))

  useEffect(() => {
    api.applyTorque([lerp(Math.random(), -50, 50), lerp(Math.random(), -50, 50), lerp(Math.random(), -50, 50)])
    api.velocity.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
  }, [])

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <Sphere args={[0.4]} castShadow receiveShadow>
        <MeshWobbleMaterial color="red" speed={5} factor={50} />
        <pointLight
          position={[-0.75, 0, 0]}
          intensity={1}
          color="red"
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={2}
          decay={2}
        />
        <pointLight
          position={[0.75, 0, 0]}
          intensity={1}
          color="red"
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={2}
          decay={2}
        />
      </Sphere>
    </group>
  )
}
