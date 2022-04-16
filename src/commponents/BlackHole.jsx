import React from 'react'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'

import { BLACK_HOLE_GROUP } from '../groups'

const AnimatedSphere = animated(Sphere)

export function BlackHole({ isOpen, ...props }) {
  const { scale, intensity } = useSpring({
    scale: isOpen ? 1 : 0,
    intensity: isOpen ? 5 : 0,
    config: { bounce: 5, duration: 1000 },
  })
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 30,
    ...props,
    collisionFilterGroup: BLACK_HOLE_GROUP,
  }))

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <AnimatedSphere args={[1]} scale={scale} castShadow receiveShadow>
        <MeshDistortMaterial color="black" speed={5} distort={1} radius={1} />
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
