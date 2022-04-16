import React, { useState } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useSphere } from '@react-three/cannon'
import { Sphere } from '@react-three/drei'

import { COLLECTED_STAR_GROUP, FLOOR_GROUP, STAR_GROUP } from '../groups'

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
    allowSleep: true,
    collisionFilterGroup: STAR_GROUP,
    onCollide: (stuff) => {
      if (stuff.contact.bj.uuid === 'player') {
        setCollected(true)

        api.collisionFilterMask.set(FLOOR_GROUP)
        api.collisionFilterGroup.set(COLLECTED_STAR_GROUP)
        api.applyForce(
          stuff.contact.ni.map((n) => n / 500),
          [0, 0, 0]
        )

        setTimeout(() => api.collisionFilterMask.set(null), 200)
      }
    },
  }))

  return (
    <AnimatedSphere args={[0.4]} ref={ref} dispose={null} scale={scale} castShadow receiveShadow uuid={props.uuid}>
      <animated.meshPhongMaterial shininess={100} emissive={color} />
    </AnimatedSphere>
  )
}
