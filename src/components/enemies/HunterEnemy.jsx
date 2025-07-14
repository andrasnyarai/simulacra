import React, { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshWobbleMaterial, Dodecahedron } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { animated, useSpring } from '@react-spring/three'

import { ENEMY_GROUP, ENEMY_MATERIAL, ENEMY_MOVEMENT_SPEED } from '../../constants'
import { lerp } from '../../utils'
import { useEnemyDeathEffect } from './useEnemyDeathEffect'
import { useStore } from '../../useStore'

const movementBound = 10 * ENEMY_MOVEMENT_SPEED

const AnimatedMeshWobbleMaterial = animated(MeshWobbleMaterial)

export function HunterEnemy(props) {
  const baseColor = props.color || 'red'
  const destroyed = props.destroyed
  const [isAttacking, setIsAttacking] = useState(false)
  const { factor, color } = useSpring({ factor: isAttacking ? 50 : 5, color: isAttacking ? 'mediumvioletred' : baseColor })
  const { isPoweredUpDestroyer } = useStore((state) => state)
  const [ref, api] = useSphere(() => ({
    args: [0.6],
    mass: 3,
    ...props,
    material: ENEMY_MATERIAL,
    collisionFilterGroup: ENEMY_GROUP,
  }))
  const [fieldRef, fieldApi] = useSphere(() => ({
    args: [4],
    isTrigger: true,
    mass: 0,
    ...props,
    onCollide: ({ contact }) => {
      if (contact.bi.uuid.includes('player')) {
        setIsAttacking(true)
        api.velocity.set(...contact.ni.map((n) => n * -8))
        setTimeout(() => setIsAttacking(false), 500)
      }
    },
  }))
  let deathFlashColor = undefined;
  if (isPoweredUpDestroyer()) {
    deathFlashColor = '#66ccff';
  }
  const [spring] = useEnemyDeathEffect(destroyed, baseColor, api, deathFlashColor)

  useFrame(({ clock }) => {
    if (!destroyed && clock.elapsedTime % Math.random() < 0.005 && !isAttacking) {
      api.velocity.set(lerp(Math.random(), -movementBound, movementBound), 0, lerp(Math.random(), -movementBound, movementBound))
    }
  })

  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, y, z]) => {
      fieldApi.position.set(x, y, z)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (isPoweredUpDestroyer()) {
      spring.color.start('white')
      spring.emissive.start('white')
      spring.emissiveIntensity.start(1.5)
    } else {
      spring.color.start(baseColor)
      spring.emissive.start(baseColor)
      spring.emissiveIntensity.start(0.2)
    }
  }, [isPoweredUpDestroyer()])

  return (
    <animated.group ref={ref} dispose={null} uuid={props.uuid} scale-y={spring.scaleY} scale={spring.scale}>
      <mesh ref={fieldRef} uuid={props.fieldUuid} />
      <Dodecahedron args={[0.6, 0]} castShadow receiveShadow>
        <AnimatedMeshWobbleMaterial speed={5} factor={factor} color={spring.color} emissive={spring.emissive} emissiveIntensity={spring.emissiveIntensity} transparent opacity={spring.opacity}  />
      </Dodecahedron>
    </animated.group>
  )
}
