import React, { useEffect, useState } from 'react'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'

import { BLACK_HOLE_GROUP, FLOOR_GROUP, PLAYER_GROUP } from '../constants'
import { useStore } from '../useStore'

const AnimatedSphere = animated(Sphere)
const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial)

export function BlackHole(props) {
  const { levelColor, isGateOpen } = useStore((state) => state)
  const { scale, intensity } = useSpring({
    scale: isGateOpen ? 1 : 0,
    intensity: isGateOpen ? 150 : 0, // Increased from 20 to 150
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
      if (contact.bi.uuid.includes('player')) {
        setTransitioning(true)
      }
    },
  }))

  useEffect(() => {
    if (isGateOpen) {
      api.collisionFilterMask.set(FLOOR_GROUP | PLAYER_GROUP)
    } else {
      api.position.set(0, 1, 0)
      api.velocity.set(0, 0, 0)
      api.collisionFilterMask.set(FLOOR_GROUP)
      setTransitioning(false)
    }
  }, [isGateOpen])

  return (
    <group ref={ref} dispose={null} uuid={props.uuid}>
      <AnimatedSphere args={[1]} scale={scale}>
        <AnimatedMeshDistortMaterial 
          color="black" 
          speed={5} 
          distort={distort} 
          radius={radius}
          emissive={levelColor}
          emissiveIntensity={0.3} // Even lower emissive
          metalness={0.9}
        />
        <animated.pointLight
          position={[0, 0, 0]}
          intensity={intensity}
          color={levelColor}
          distance={120} // Increased from 40 to 120
          castShadow
          shadow-mapSize-height={512 * 2}
          shadow-mapSize-width={512 * 2}
        />
      </AnimatedSphere>
    </group>
  )
}
