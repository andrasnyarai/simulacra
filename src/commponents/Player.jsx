import React, { useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Trail, MeshDistortMaterial } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'
import { useDrag } from '@use-gesture/react'

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

  useDrag(
    ({ movement: [x, y] }) => {
      api.velocity.set(x * 0.05, 0, y * 0.05)
    },
    { target: document.getElementById('root') }
  )

  const { camera } = useThree()

  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, , z]) => {
      camera.position.x = x
      camera.position.z = z
    })

    if (!alive) {
      unsubscribe()
    }

    return unsubscribe
  }, [alive])

  const wHandler = useKeyPress('w')
  const sHandler = useKeyPress('s')
  const aHandler = useKeyPress('a')
  const dHandler = useKeyPress('d')

  const arrowUpHandler = useKeyPress('ArrowUp')
  const arrowDownHandler = useKeyPress('ArrowDown')
  const arrowLeftHandler = useKeyPress('ArrowLeft')
  const arrowRightHandler = useKeyPress('ArrowRight')

  useFrame(() => {
    const up = wHandler.current || arrowUpHandler.current
    const down = sHandler.current || arrowDownHandler.current
    const left = aHandler.current || arrowLeftHandler.current
    const right = dHandler.current || arrowRightHandler.current
    let velocity = 30

    if (up && (right || left)) {
      velocity = velocity / Math.sqrt(2)
    }

    if (down && (right || left)) {
      velocity = velocity / Math.sqrt(2)
    }

    if (up) {
      api.applyForce([0, 0, -velocity], [0, 0, 0])
    }
    if (down) {
      api.applyForce([0, 0, velocity], [0, 0, 0])
    }
    if (left) {
      api.applyForce([-velocity, 0, 0], [0, 0, 0])
    }
    if (right) {
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
          <MeshDistortMaterial color="white" emissive="white" speed={5} distort={0.5} radius={1} />
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
