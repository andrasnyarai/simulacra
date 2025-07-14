import React, { useState, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useSpring, animated } from '@react-spring/three'
import { useDrag } from '@use-gesture/react'

import { isMobile, map, useKeyPress } from '../utils'
import { FLOOR_GROUP, OBSTACLE_GROUP, PLAYER_GROUP, PLAYER_MATERIAL, PROJECTILE_GROUP } from '../constants'
import { useStore } from '../useStore'

const AnimatedSphere = animated(Sphere)

const initialLightIntensity = 1
const maxLightIntensity = 2

export function Player(props) {
  const { playerPosition, collectStar, collectedStarsOnLevel, starCount, loadNextLevel, isPlayerAlive, looseLife, level, isPoweredUpDestroyer, setCurrentPowerup, clearCurrentPowerup } = useStore(
    (state) => state
  )
  const { camera } = useThree()

  const [lightIntensity, setLightIntensity] = useState(initialLightIntensity)
  const [isHidden, setIsHidden] = useState(false)
  const size = starCount === 0 ? 1 : map(collectedStarsOnLevel, [0, starCount], [0.2, 1])
  const { scale, shieldScale, intensity } = useSpring({
    shieldScale: isHidden ? 0.1 : 1,
    scale: isHidden ? 0.1 : Math.min(size, 1),
    intensity: isHidden ? 1 : 0.05,
  })

  const poweredUpRef = useRef(null)
  // useEffect(() => {
  //   // poweredUpRef.current = poweredUp
  // }, [poweredUp])

  // Reset powerup on level change
  useEffect(() => {
    clearCurrentPowerup()
  }, [level])

  const [ref, api] = useSphere(() => ({
    args: [0.5],
    mass: 2,
    ...props,
    allowSleep: true,
    collisionFilterGroup: PLAYER_GROUP,
    material: PLAYER_MATERIAL,
    onCollide: ({ contact }) => {
      if (contact.bj.uuid.includes('enemy') || contact.bj.uuid.includes('enemy-projectile')) {

        if (isPoweredUpDestroyer()) {
          // Destroy enemy: set its velocity high and remove from scene after a delay
          if (contact.bj && contact.bj._physijs) {
            contact.bj.velocity.set(0, 10, 0)
          }
          if (contact.bj.uuid && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('destroy-enemy', { detail: { uuid: contact.bj.uuid } }))
          }
        } else {
          setIsHidden(true)
          api.collisionFilterMask.set(null)
          looseLife()
        }
      }

      if (contact.bj.uuid.includes('black-hole')) {
        setIsHidden(true)
        api.collisionFilterMask.set(null)
        api.velocity.set(0, -1, 0)
        setTimeout(() => loadNextLevel(), 200)
      }

      if (contact.bj.uuid.includes('star')) {
        // Calculate increment per star
        const increment = (maxLightIntensity - initialLightIntensity) / (starCount || 1)
        setLightIntensity((intensity) => {
          const next = intensity + increment
          return next > maxLightIntensity ? maxLightIntensity : next
        })
        collectStar()
      }
      if (contact.bj.uuid.includes('powerup')) {
        setCurrentPowerup({ type: 'Destroyer' })
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
    api.collisionFilterMask.set(FLOOR_GROUP | OBSTACLE_GROUP | PROJECTILE_GROUP)

    setIsHidden(false)
  }, [level])

  useEffect(() => {
    // respawn reposition
    if (isPlayerAlive && isHidden) {
      setLightIntensity(initialLightIntensity)
      const [x, y, z] = playerPosition
      if (level === 0) {
        api.position.set(0, 0.5, 0)
      } else {
        api.position.set(x, y, z)
      }
      api.velocity.set(0, 0, 0)
      api.collisionFilterMask.set(FLOOR_GROUP | OBSTACLE_GROUP | PROJECTILE_GROUP)
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
      <group ref={ref} uuid={props.uuid} dispose={null}>
        <AnimatedSphere args={[0.5]} scale={shieldScale}>
          <MeshDistortMaterial emissive="white" wireframe speed={5} distort={0.5} radius={1} />
        </AnimatedSphere>
        <AnimatedSphere args={[0.5]} scale={scale} castShadow receiveShadow>
          <MeshDistortMaterial color="white" emissive="white" speed={5} distort={0.5} radius={1} />
        </AnimatedSphere>
        <pointLight intensity={lightIntensity} distance={40} decay={.5} />
      </group>
    </>
  )
}
