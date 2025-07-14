import React, { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useSphere } from '@react-three/cannon'
import { Icosahedron } from '@react-three/drei'

import { COLLECTED_STAR_GROUP, FLOOR_GROUP, STAR_GROUP, POWERUP_CONFIGS } from '../constants'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../useStore'

export function Powerup({ size = 0.6, powerupType, onCollect, ...props }) {
  const { isPlayerAlive, setCurrentPowerup, collectAllStars } = useStore((state) => state)
  const [collected, setCollected] = useState(false)
  const color = POWERUP_CONFIGS[powerupType]?.color
  const { scale, animatedColor, glow } = useSpring({
    scale: collected ? 0.5 : 1,
    animatedColor: collected ? 'white' : color,
    glow: collected ? 2 : 1.2,
    config: { mass: 1, tension: 280, friction: 60 },
  })

  const [ref, api] = useSphere(() => ({
    args: [size],
    mass: 0.00001,
    ...props,
    collisionFilterGroup: STAR_GROUP,
    onCollide: ({ contact }) => {
      if (contact.bi.uuid.includes('player')) {
        setCollected(true)
        setCurrentPowerup({ type: powerupType })
        if (powerupType === 'Collector') {
          collectAllStars()
        }
        api.collisionFilterMask.set(FLOOR_GROUP)
        api.collisionFilterGroup.set(COLLECTED_STAR_GROUP)
        api.velocity.set(...contact.ri.map((n) => n * -10))
        if (onCollect) onCollect()
        setTimeout(() => api.collisionFilterMask.set(null), 200)
      }
    },
  }))

  const position = useRef([0, 0, 0])
  useEffect(() => {
    const unsubscribe = api.position.subscribe((v) => (position.current = v))
    return unsubscribe
  }, [])

  useFrame(({ camera }) => {
    
    const speed = 20
    
    if (collected && isPlayerAlive) {
      const [ax, ay, az] = position.current
      const [bx, by, bz] = camera.position
      const dx = bx - ax
      const dy = by - ay
      const dz = bz - az
      api.velocity.set(dx * speed, (dy - 40) * speed, dz * speed)
    }
  })

  return (
    <animated.group ref={ref} scale={scale} dispose={null} uuid={props.uuid}>
      <Icosahedron args={[size, 0]} castShadow receiveShadow>
        <animated.meshStandardMaterial
          color={animatedColor}
          emissive={animatedColor}
          emissiveIntensity={glow}
          metalness={0.7}
          roughness={0.2}
        />
      </Icosahedron>
      <Icosahedron args={[size * 1.15, 0]}>
        <meshBasicMaterial color={animatedColor} transparent opacity={0.25} wireframe />
      </Icosahedron>
    </animated.group>
  )
} 