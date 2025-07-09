import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { useSphere } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { ENEMY_GROUP, ENEMY_MATERIAL, FLOOR_GROUP, PROJECTILE_GROUP, OBSTACLE_GROUP, PLAYER_GROUP } from '../constants'
import { useEnemyDeathEffect } from './useEnemyDeathEffect'
import { useStore } from '../useStore'

const FIRE_COOLDOWN = 1.8 // seconds
const PROJECTILE_SPEED = 15
const PROJECTILE_SIZE = 0.25

export function ShooterEnemy(props) {
  const color = props.color || 'red'
  const destroyed = props.destroyed
  const [ref, api] = useSphere(() => ({
    args: [0.6],
    mass: 2,
    ...props,
    material: ENEMY_MATERIAL,
    collisionFilterGroup: ENEMY_GROUP,
  }))
  const [spring, apiSpring] = useEnemyDeathEffect(destroyed, color, api)

  // Track the camera/player position
  const playerPositionRef = useRef([0, 0, 0])
  const { camera } = useThree()
  useFrame(() => {
    playerPositionRef.current = camera.position.toArray()
  })

  // Track the enemy's own position
  const position = useRef(props.position ? [...props.position] : [0, 0, 0])
  useEffect(() => {
    const unsubscribe = api.position.subscribe((v) => (position.current = v))
    return unsubscribe
  }, [])

  // Projectile orb directly under the enemy, only collides with the floor
  const looseLife = useStore((state) => state.looseLife)
  const [projectileRef, projectileApi] = useSphere(() => ({
    args: [PROJECTILE_SIZE],
    mass: 0.1,
    position: [props.position[0], (props.position[1] || 0) - 1, props.position[2]],
    collisionFilterGroup: PROJECTILE_GROUP,
    collisionFilterMask: FLOOR_GROUP | OBSTACLE_GROUP | PLAYER_GROUP,
    onCollide: ({ contact }) => {
    //     console.log('projectile onCollide', contact.bi.uuid)
    //   if (contact.bi && contact.bi.uuid && contact.bi.uuid.includes('player')) {
    //     looseLife();
    //   }
    },
  }))

  // Firing cadence
  const cooldown = useRef(0)
  const willFire = useRef(false)
  
  useFrame((_, delta) => {
    if (destroyed) return
    // Prevent spinning
    api.angularVelocity.set(0, 0, 0)
    api.angularDamping.set(1)
    cooldown.current -= delta
    if (cooldown.current <= 0.25 && cooldown.current > 0 && !willFire.current) {
        willFire.current = true
        // Animate the "redness" (emissive color) to a bright red, then back to original
        apiSpring.start({ 
            emissive: '#ff0000', 
            emissiveIntensity: 3.5, 
            config: { duration: 120 }, 
            onRest: () => {
                apiSpring.start({ emissive: color, emissiveIntensity: 0.2, config: { duration: 220 } })
            }
        })
    }
    if (cooldown.current <= 0) {
      willFire.current = false

      // Reset projectile position to under the enemy
      const [ex, ey, ez] = position.current
      projectileApi.position.set(ex, ey + 2, ez) // spawn above the floor 
      projectileApi.velocity.set(0, 0, 0);
      projectileApi.angularVelocity.set(0, 0, 0);
      projectileApi.quaternion.set(0, 0, 0, 1); //
      // Calculate direction to player, but keep y direction low
      const [px, py, pz] = playerPositionRef.current
      const dx = px - ex
      const dz = pz - ez
      const dy = py - ey - 50// minimal vertical component
      const dist = Math.sqrt(dx * dx + dz * dz) || 1
      // Set velocity toward player
      projectileApi.velocity.set(
        (dx / dist) * PROJECTILE_SPEED,
        (dy / dist) * PROJECTILE_SPEED,
        (dz / dist) * PROJECTILE_SPEED
      )
      cooldown.current = FIRE_COOLDOWN + Math.random() * 0.7
    }
  })

  // Ref for the gun mesh
  const gunRef = useRef()
  useFrame(() => {
    playerPositionRef.current = camera.position.toArray()
    // --- Gun visual: offset in the direction of the player ---
    if (gunRef.current && position.current) {
      const [ex, ey, ez] = position.current
      const [px, , pz] = playerPositionRef.current
      const dx = px - ex
      const dz = pz - ez
      const dist = Math.sqrt(dx * dx + dz * dz) || 1
      const dirX = dx / dist
      const dirZ = dz / dist
      const offset = 0.7
      gunRef.current.position.set(ex + dirX * offset, ey + 0.25, ez + dirZ * offset)
      // Point the gun in the direction of the player
      gunRef.current.lookAt(px, ey + 0.25, pz)
    }
  })

  // Spring for projectile opacity
  const [projSpring, projApi] = useSpring(() => ({ opacity: 1, config: { tension: 180, friction: 24 } }))

  useEffect(() => {
    if (destroyed) {
      // Remove projectile collision and fade out
      projectileApi.collisionFilterMask.set(0)
      projApi.start({ opacity: 0 })
    } else {
      // Restore collision and fade in
      projectileApi.collisionFilterMask.set(FLOOR_GROUP | OBSTACLE_GROUP | PLAYER_GROUP)
      projApi.start({ opacity: 1 })
    }
  }, [destroyed])

  return (
    <>
      <animated.group ref={ref} dispose={null} uuid={props.uuid} scale-y={spring.scaleY} scale={spring.scale}>
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[0.6, 0]} />
          <animated.meshStandardMaterial color={spring.color} emissive={spring.emissive} emissiveIntensity={spring.emissiveIntensity} transparent opacity={spring.opacity} metalness={0.7} roughness={0.2} />
        </mesh>
      </animated.group>
      {/* Projectile orb visually under the enemy, collides with floor only, not parented */}
      <animated.mesh uuid={`enemy-projectile-${props.uuid}`} ref={projectileRef} castShadow receiveShadow>
        {/* <sphereGeometry args={[0.25, 16, 16]} /> */}
        <octahedronGeometry args={[PROJECTILE_SIZE, 0]} />
        <animated.meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={projSpring.opacity} />
      </animated.mesh>
      {/* Gun visual: offset in the direction of the player */}
      {/* <mesh ref={gunRef}>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 12]} />
        <meshStandardMaterial color={'#fff'} emissive={'#ff00ea'} emissiveIntensity={2} />
      </mesh> */}
    </>
  )
} 