import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Icosahedron, MeshWobbleMaterial } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { animated } from '@react-spring/three'

import { lerp, runExplosionSpring } from '../utils'
import { ENEMY_MATERIAL, ENEMY_GROUP, ENEMY_MOVEMENT_SPEED } from '../constants'
import { useEnemyDeathEffect } from './useEnemyDeathEffect'

const movementBound = 7 * ENEMY_MOVEMENT_SPEED

export function WanderEnemy(props) {
  const color = props.color || 'red'
  const destroyed = props.destroyed
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 1,
    ...props,
    material: ENEMY_MATERIAL,
    collisionFilterGroup: ENEMY_GROUP,
  }))
  const [spring] = useEnemyDeathEffect(destroyed, color, api)

  useFrame(({ clock }) => {
    if (!destroyed && clock.elapsedTime % Math.random() < 0.01) {
      api.applyTorque([lerp(Math.random(), -20, 20), lerp(Math.random(), -20, 20), lerp(Math.random(), -20, 20)])
      api.velocity.set(lerp(Math.random(), -movementBound, movementBound), 0, lerp(Math.random(), -movementBound, movementBound))
    }
  })

  return (
    <animated.group ref={ref} dispose={null} uuid={props.uuid} scale-y={spring.scaleY} scale={spring.scale}>
      <Icosahedron args={[0.4, 0]} castShadow receiveShadow>
        <animated.meshStandardMaterial color={spring.color} emissive={spring.emissive} emissiveIntensity={spring.emissiveIntensity} transparent opacity={spring.opacity} speed={5} factor={5} />
      </Icosahedron>
    </animated.group>
  )
}
