import React, { useEffect, useState } from 'react'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'

import { BLACK_HOLE_GROUP, FLOOR_GROUP, PLAYER_GROUP } from '../constants'

const AnimatedSphere = animated(Sphere)
const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial)

export function BlackHole({ isOpen, ...props }) {
  const { scale, intensity } = useSpring({
    scale: isOpen ? 1 : 0,
    intensity: isOpen ? 5 : 0,
    config: { bounce: 5, duration: 1000 },
  })

  const [transitioning, setTransitioning] = useState(false)
  const { distort, radius } = useSpring({
    distort: transitioning ? 10 : 1,
    radius: transitioning ? 50 : 1,
    config: { bounce: 5, duration: 500 },
  })

  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 30,
    ...props,
    collisionFilterGroup: BLACK_HOLE_GROUP,
    collisionFilterMask: FLOOR_GROUP,
    onCollide: ({ contact }) => {
      if (contact.bj.uuid.includes('player')) {
        setTransitioning(true)
      }
    },
  }))

  useEffect(() => {
    console.log('isOpen', isOpen)
    if (isOpen) {
      api.collisionFilterMask.set(FLOOR_GROUP | PLAYER_GROUP)
    } else {
      api.position.set(0, 1, 0)
      api.velocity.set(0, 0, 0)
      api.collisionFilterMask.set(FLOOR_GROUP)
      setTransitioning(false)
    }
  }, [isOpen])

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <AnimatedSphere args={[1]} scale={scale} castShadow receiveShadow opacity={0.1} transparent>
        <AnimatedMeshDistortMaterial color="black" speed={5} distort={distort} radius={radius} />
        <animated.pointLight
          position={[0, 0, 0]}
          intensity={intensity}
          color="white"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={12}
          decay={2}
        />
      </AnimatedSphere>
    </group>
  )
}
