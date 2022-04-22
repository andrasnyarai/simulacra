import React, { useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Trail, MeshDistortMaterial } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'
import { useDrag } from '@use-gesture/react'

import { isMobile, useKeyPress } from '../utils'
import { FLOOR_GROUP, OBSTACLE_GROUP, PLAYER_GROUP, PLAYER_MATERIAL } from '../constants'
import { useStore } from '../useStore'

const AnimatedSphere = animated(Sphere)

const initialLightIntensity = 1.5

export function Player(props) {
  const { collectStar, loadNextLevel, isPlayerAlive, looseLife, level } = useStore((state) => state)
  const { camera } = useThree()

  const [lightIntensity, setLightIntensity] = useState(initialLightIntensity)
  const [isHidden, setIsHidden] = useState(false)
  const { scale, intensity } = useSpring({ scale: isHidden ? 0.1 : 1, intensity: isHidden ? 1 : 0.05 })

  const [ref, api] = useSphere(() => ({
    args: [0.5],
    mass: 2,
    ...props,
    allowSleep: true,
    collisionFilterGroup: PLAYER_GROUP,
    material: PLAYER_MATERIAL,
    onCollide: ({ contact }) => {
      if (contact.bj.uuid.includes('enemy')) {
        setIsHidden(true)
        api.collisionFilterMask.set(null)
        looseLife()
      }

      if (contact.bj.uuid.includes('black-hole')) {
        setIsHidden(true)
        api.collisionFilterMask.set(null)
        api.velocity.set(0, -1, 0)
        setTimeout(() => loadNextLevel(), 200)
      }

      if (contact.bj.uuid.includes('star')) {
        setLightIntensity((intensity) => intensity + 0.05)
        collectStar()
      }
    },
  }))

  useDrag(
    ({ movement: [x, y] }) => {
      if (!isPlayerAlive || isHidden) {
        return
      }

      const modifier = isMobile() ? 0.1 : 0.05

      api.velocity.set(x * modifier, -1, y * modifier)
    },
    { target: document.getElementById('root') }
  )

  useEffect(() => {
    // level transition reposition
    setLightIntensity(initialLightIntensity)
    api.position.set(0, 0.5, 0)
    api.velocity.set(0, 0, 0)
    api.collisionFilterMask.set(FLOOR_GROUP | OBSTACLE_GROUP)

    setIsHidden(false)
  }, [level])

  useEffect(() => {
    // respawn
    if (isPlayerAlive && isHidden) {
      setLightIntensity(initialLightIntensity)
      const [x, , z] = camera.position
      if (level === 0) {
        api.position.set(0, 0.5, 0)
      } else {
        api.position.set(x, 0.5, z)
      }
      api.velocity.set(0, 0, 0)
      api.collisionFilterMask.set(FLOOR_GROUP | OBSTACLE_GROUP)
      setIsHidden(false)
    }
  }, [isPlayerAlive])

  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, y, z]) => {
      camera.position.x = x
      camera.position.y = y + 45
      camera.position.z = z
    })

    if (!isPlayerAlive || isHidden) {
      unsubscribe()
    }

    return unsubscribe
  }, [isPlayerAlive, isHidden])

  const wHandler = useKeyPress('w')
  const sHandler = useKeyPress('s')
  const aHandler = useKeyPress('a')
  const dHandler = useKeyPress('d')

  const arrowUpHandler = useKeyPress('ArrowUp')
  const arrowDownHandler = useKeyPress('ArrowDown')
  const arrowLeftHandler = useKeyPress('ArrowLeft')
  const arrowRightHandler = useKeyPress('ArrowRight')

  useFrame(() => {
    if (!isPlayerAlive || isHidden) {
      return
    }
    const up = wHandler.current || arrowUpHandler.current
    const down = sHandler.current || arrowDownHandler.current
    const left = aHandler.current || arrowLeftHandler.current
    const right = dHandler.current || arrowRightHandler.current
    let velocity = 90

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
    <>
      <animated.ambientLight intensity={intensity} color="white" />
      <Trail
        width={3}
        color="white"
        length={1.5}
        decay={1}
        local={false}
        stride={0}
        interval={1}
        target={undefined}
        attenuation={(width) => width}
      >
        <group ref={ref} uuid={props.uuid} dispose={null}>
          <AnimatedSphere args={[0.5]} scale={scale} castShadow receiveShadow>
            <MeshDistortMaterial color="white" emissive="white" speed={5} distort={0.5} radius={1} />
          </AnimatedSphere>
          <pointLight intensity={lightIntensity} distance={20} />
        </group>
      </Trail>
    </>
  )
}
