import React, { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useSphere } from '@react-three/cannon'
import { Sphere, Trail } from '@react-three/drei'

import { COLLECTED_STAR_GROUP, FLOOR_GROUP, PLAYER_GROUP, STAR_GROUP } from '../constants'
import { useFrame } from '@react-three/fiber'

const AnimatedSphere = animated(Sphere)

export function Star(props) {
  const [collected, setCollected] = useState(false)
  const { scale, color } = useSpring({
    scale: collected ? 0.1 : 1,
    color: collected ? 'white' : 'orange',
    config: { mass: 1, tension: 280, friction: 60 },
  })

  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 0.00001,
    ...props,
    collisionFilterGroup: STAR_GROUP,
    onCollide: ({ contact }) => {
      if (contact.bi.uuid.includes('player')) {
        setCollected(true)

        api.collisionFilterMask.set(FLOOR_GROUP)
        api.collisionFilterGroup.set(COLLECTED_STAR_GROUP)
        api.velocity.set(...contact.ri.map((n) => n * -10))

        setTimeout(() => api.collisionFilterMask.set(null), 200)
      }
    },
  }))

  const position = useRef([0, 0, 0])
  useEffect(() => {
    const unsubscribe = api.position.subscribe((v) => (position.current = v))
    return unsubscribe
  }, [])

  useFrame(({ camera, clock }) => {
    if (collected) {
      const [ax, ay, az] = position.current
      const [bx, by, bz] = camera.position

      const dx = bx - ax
      const dy = by - ay
      const dz = bz - az

      api.velocity.set(dx * props.speed, (dy - 40) * props.speed, dz * props.speed)
    }
  })

  return (
    <AnimatedSphere args={[0.4]} ref={ref} dispose={null} scale={scale} castShadow receiveShadow uuid={props.uuid}>
      <animated.meshPhongMaterial shininess={100} emissive={color} />
    </AnimatedSphere>
  )
}
