import React, { useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshWobbleMaterial, Sphere, Dodecahedron } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { animated, useSpring } from '@react-spring/three'

import { ENEMY_GROUP } from '../groups'
import { lerp } from '../utils'
import { enemyMaterial } from '../materials'

export function HunterEnemy(props) {
  const [isAttacking, setIsAttacking] = useState(false)
  const { intensity } = useSpring({ intensity: isAttacking ? 15 : 5 })
  const [ref, api] = useSphere(() => ({
    args: [0.6],
    mass: 3,
    ...props,
    material: enemyMaterial,
    collisionFilterGroup: ENEMY_GROUP,
  }))

  const [fieldRef, fieldApi] = useSphere(() => ({
    args: [4],
    isTrigger: true,
    mass: 0,
    ...props,
    onCollide: ({ contact }) => {
      if (contact.bj.uuid.includes('player')) {
        setIsAttacking(true)
        api.velocity.set(...contact.ni.map((n) => n * 8))

        setTimeout(() => setIsAttacking(false), 500)
      }
    },
  }))

  useFrame(({ clock }) => {
    if (clock.elapsedTime % Math.random() < 0.005 && !isAttacking) {
      api.velocity.set(lerp(Math.random(), -10, 10), 0, lerp(Math.random(), -10, 10))
    }
  })

  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, y, z]) => {
      fieldApi.position.set(x, y, z)
    })

    return unsubscribe
  }, [])

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <mesh ref={fieldRef} uuid={props.fieldUuid} />
      <Dodecahedron args={[0.6, 0]} castShadow receiveShadow>
        <MeshWobbleMaterial color="purple" speed={5} factor={50} />
        <animated.pointLight
          position={[-0.75, 0, 0]}
          intensity={intensity}
          color="purple"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={10}
        />
        <animated.pointLight
          position={[0.75, 0, 0]}
          intensity={intensity}
          color="purple"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={10}
        />
      </Dodecahedron>
    </group>
  )
}
