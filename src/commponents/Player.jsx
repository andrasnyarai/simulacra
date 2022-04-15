import React, { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Trail } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'

import { useKeyPress } from '../utils'
import { FLOOR_GROUP, PLAYER_GROUP } from '../groups'
import { playerMaterial } from '../materials'

const AnimatedSphere = animated(Sphere)

export function Player(props) {
  const [alive, setAlive] = useState(true)
  const [lightIntensity, setLightIntensity] = useState(0.1)
  const { scale } = useSpring({ scale: alive ? 1 : 0.1 })

  const [ref, api] = useSphere(() => ({
    args: [0.5],
    mass: 2,
    ...props,
    collisionFilterGroup: PLAYER_GROUP,
    material: playerMaterial,
    onCollide: ({ contact }) => {
      if (contact.bi.uuid.includes('enemy')) {
        setAlive(false)

        api.collisionFilterMask.set(FLOOR_GROUP)
        api.applyForce(
          contact.ni.map((n) => n * -1),
          [0, 0, 0]
        )

        setTimeout(() => api.collisionFilterMask.set(null), 200)
      }

      if (contact.bi.uuid.includes('star')) {
        setLightIntensity((intensity) => intensity + 0.05)
      }
    },
  }))

  const up = useKeyPress('w')
  const down = useKeyPress('s')
  const left = useKeyPress('a')
  const right = useKeyPress('d')

  useFrame(() => {
    let velocity = 30

    if (up.current && (right.current || left.current)) {
      velocity = velocity / Math.sqrt(2)
    }

    if (down.current && (right.current || left.current)) {
      velocity = velocity / Math.sqrt(2)
    }

    if (up.current) {
      api.applyForce([0, 0, -velocity], [0, 0, 0])
    }
    if (down.current) {
      api.applyForce([0, 0, velocity], [0, 0, 0])
    }
    if (left.current) {
      api.applyForce([-velocity, 0, 0], [0, 0, 0])
    }
    if (right.current) {
      api.applyForce([velocity, 0, 0], [0, 0, 0])
    }
  })

  return (
    <Trail
      width={3}
      color={'white'}
      length={2}
      decay={1}
      local={false}
      stride={0}
      interval={1}
      target={undefined}
      attenuation={(width) => width}
    >
      <group ref={ref} uuid="player" dispose={null}>
        <AnimatedSphere args={[0.5]} scale={scale} castShadow receiveShadow>
          <meshBasicMaterial color="white" />
        </AnimatedSphere>
        <pointLight
          intensity={lightIntensity}
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={lightIntensity * 100}
          decay={lightIntensity * 10}
        />
      </group>
    </Trail>
  )
}
