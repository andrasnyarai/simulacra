import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars as StarsBackground } from '@react-three/drei'
import { Physics, useContactMaterial, Debug } from '@react-three/cannon'

import { ENEMY_MATERIAL, PLANE_MATERIAL, PLAYER_MATERIAL } from './constants'
import { isMobile, lerp, calculateStartingPosition, calculateNonOverlappingPositions } from './utils'
import { useStore } from './useStore'
import { Terrain } from './components/Terrain'
import { Player } from './components/Player'
import { Obstacle } from './components/Obstacle'
import { Star } from './components/Star'
import { WanderEnemy } from './components/WanderEnemy'
import { HunterEnemy } from './components/HunterEnemy'
import { BlackHole } from './components/BlackHole'
import { Effects } from './components/Effects'
import { Menu } from './components/Menu'
import { Powerup } from './components/Powerup'
import { ShooterEnemy } from './components/ShooterEnemy'

// Utility: place stars safely so they don't overlap obstacles or each other
function placeStarsSafely(starPositions, obstaclePositions, mapWidth, mapHeight, clusterCenter = null, clusterRadius = null) {
  function isOverlapping(posA, sizeA, posB, sizeB) {
    const dx = posA.x - posB.x
    const dz = posA.z - posB.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    return dist < (sizeA + sizeB)
  }
  const obstacleObjs = obstaclePositions.map(o => ({ ...o, size: o.size || 2 }))
  const starSafePositions = []
  for (let i = 0; i < starPositions.length; i++) {
    let star = starPositions[i]
    let tries = 0
    let maxTries = 20
    while (tries < maxTries) {
      const overlaps = obstacleObjs.some(ob => isOverlapping(star.position, 0.4, ob.position, ob.size)) ||
        starSafePositions.some(s => isOverlapping(star.position, 0.4, s.position, 0.4))
      if (!overlaps) break
      // Move to a new random position
      if (clusterCenter && clusterRadius) {
        const angle = 2 * Math.PI * Math.random()
        const r = clusterRadius * (0.5 + Math.random() * 0.5)
        star = {
          ...star,
          position: {
            x: clusterCenter.x + Math.cos(angle) * r + (Math.random() - 0.5) * 2,
            z: clusterCenter.z + Math.sin(angle) * r + (Math.random() - 0.5) * 2,
          }
        }
      } else {
        star = {
          ...star,
          position: {
            x: lerp(Math.random(), -mapWidth / 2 + 1, mapWidth / 2 - 1),
            z: lerp(Math.random(), -mapHeight / 2 + 1, mapHeight / 2 - 1),
          }
        }
      }
      tries++
    }
    starSafePositions.push(star)
  }
  return starSafePositions
}

const ObstaclesAndStars = React.memo(({ mapWidth, mapHeight, level, starCount, obstacleCount, obstacleColor, starColor, layoutPattern,  powerupType }) => {
  let positions = []
  if (layoutPattern === 'star-cluster') {
    // Cluster stars in the center, obstacles random
    const clusterCenter = { x: 0, z: 0 }
    const clusterRadius = Math.min(mapWidth, mapHeight) / 4
    let starPositions = Array.from({ length: starCount }, (_, i) => {
      const angle = (2 * Math.PI * i) / starCount
      const r = clusterRadius * (0.5 + Math.random() * 0.5)
      return { type: 'STAR', position: {
        x: clusterCenter.x + Math.cos(angle) * r + (Math.random() - 0.5) * 2,
        z: clusterCenter.z + Math.sin(angle) * r + (Math.random() - 0.5) * 2,
      }, size: 0.4 }
    })
    const obstacleDefs = [...new Array(obstacleCount)].map(() => ({ type: 'OBSTACLE' }))
    const obstaclePositions = calculateNonOverlappingPositions(obstacleDefs, mapWidth, mapHeight)
    const starSafePositions = placeStarsSafely(starPositions, obstaclePositions, mapWidth, mapHeight, clusterCenter, clusterRadius)
    positions = obstaclePositions.concat(starSafePositions)
  } else if (layoutPattern === 'obstacle-maze') {
    // Arrange obstacles in a simple grid/maze, stars random
    const rows = Math.max(2, Math.floor(Math.sqrt(obstacleCount)))
    const cols = Math.max(2, Math.ceil(obstacleCount / rows))
    const spacingX = mapWidth / (cols + 1)
    const spacingZ = mapHeight / (rows + 1)
    const mazeObstacles = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (mazeObstacles.length < obstacleCount && (r % 2 === 0 || c % 2 === 0)) {
          mazeObstacles.push({
            type: 'OBSTACLE',
            position: {
              x: -mapWidth / 2 + (c + 1) * spacingX,
              z: -mapHeight / 2 + (r + 1) * spacingZ,
            },
            size: 2,
          })
        }
      }
    }
    const starDefs = [...new Array(starCount)].map(() => ({ type: 'STAR' }))
    let starPositions = calculateNonOverlappingPositions(starDefs, mapWidth, mapHeight)
    const starSafePositions = placeStarsSafely(starPositions, mazeObstacles, mapWidth, mapHeight)
    positions = mazeObstacles.concat(starSafePositions)
  } else {
    // Default: random placement
    const objectDefinitions = [...new Array(obstacleCount)]
      .map(() => ({ type: 'OBSTACLE' }))
      .concat([...new Array(starCount)].map(() => ({ type: 'STAR' })))
    positions = calculateNonOverlappingPositions(objectDefinitions, mapWidth, mapHeight)
  }

  // Always add a Powerup for debug
  function isOverlapping(posA, sizeA, posB, sizeB) {
    const dx = posA.x - posB.x
    const dz = posA.z - posB.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    return dist < (sizeA + sizeB)
  }

  let tries = 0
  let maxTries = 30
  let found = false
  let pos = null
  while (!found && tries < maxTries) {
    pos = {
      x: lerp(Math.random(), -mapWidth / 2 + 1, mapWidth / 2 - 1),
      z: lerp(Math.random(), -mapHeight / 2 + 1, mapHeight / 2 - 1),
    }
    const overlaps = positions.some(obj => isOverlapping(pos, 0.6, obj.position, obj.size || 0.4))
    if (!overlaps) found = true
    tries++
  }

  let powerup = null

  if (powerupType) {
    powerup = <Powerup key={`powerup-${level}`} position={[pos.x, 1, pos.z]} uuid={`powerup-${level}`} powerupType={powerupType} />
  }

  return (
    <>
      {positions
        .filter(({ type }) => type === 'STAR')
        .map(({ position: { x, z }, size }, i) => {
          const speed = lerp(Math.random(), 5, 20)
          return <Star key={`star-${i}-${level}`} position={[x, 1, z]} uuid={`star-${i}-${level}`} speed={speed} size={size} color={starColor} />
        })}
      {positions
        .filter(({ type }) => type === 'OBSTACLE')
        .map(({ position: { x, z }, size }, i) => {
          return <Obstacle key={`obstacle-${i}-${level}`} position={[x, size, z]} uuid={`obstacle-${i}-${level}`} size={size} color={obstacleColor} />
        })}
      {powerup}
    </>
  )
})

const Scene = () => {
  const {
    playerPosition,
    level,
    levelColor,
    mapWidth,
    mapHeight,
    starCount,
    obstacleCount,
    wanderEnemyCount,
    hunterEnemyCount,
    shooterEnemyCount,
    enemyColor,
    obstacleColor,
    starColor,
    layoutPattern,
    powerupType,
  } = useStore((state) => state)

  const [destroyedEnemies, setDestroyedEnemies] = useState([])

  // Listen for destroy-enemy events
  useEffect(() => {
    function handleDestroyEnemy(e) {
      const uuid = e.detail?.uuid
      if (uuid) setDestroyedEnemies((prev) => [...prev, uuid])
    }
    window.addEventListener('destroy-enemy', handleDestroyEnemy)
    return () => window.removeEventListener('destroy-enemy', handleDestroyEnemy)
  }, [])

  // Helper to filter out destroyed enemies, but delay actual removal for fade-out
  const [recentlyDestroyed, setRecentlyDestroyed] = useState([])

  useEffect(() => {
    if (destroyedEnemies.length > 0) {
      const newOnes = destroyedEnemies.filter(uuid => !recentlyDestroyed.includes(uuid))
      if (newOnes.length > 0) {
        setRecentlyDestroyed(prev => [...prev, ...newOnes])
        setTimeout(() => {
          setRecentlyDestroyed(current => current.filter(uuid => !newOnes.includes(uuid)))
        }, 400) // match fade duration
      }
    }
  }, [destroyedEnemies])

  const isDestroyed = useCallback(
    (uuid) => destroyedEnemies.includes(uuid),
    [destroyedEnemies]
  )
  const shouldRender = useCallback(
    (uuid) => !destroyedEnemies.includes(uuid) || recentlyDestroyed.includes(uuid),
    [destroyedEnemies, recentlyDestroyed]
  )

  useContactMaterial(PLANE_MATERIAL, PLAYER_MATERIAL)
  useContactMaterial(PLANE_MATERIAL, ENEMY_MATERIAL)

  return (
    <Suspense fallback={null}>

      <Terrain mapWidth={mapWidth} mapHeight={mapHeight} color={levelColor} level={level} />

      <Player position={playerPosition} uuid={`player`} />
      <BlackHole position={[0, 1, 0]} uuid={`black-hole`} />

      <ObstaclesAndStars mapHeight={mapHeight} mapWidth={mapWidth} level={level} obstacleCount={obstacleCount} starCount={starCount} obstacleColor={obstacleColor} starColor={starColor} layoutPattern={layoutPattern} powerupType={powerupType} />

      {/* Enemies, filtered by destroyedEnemies */}
      {[...new Array(wanderEnemyCount)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 5)
        const uuid = `wander-enemy-${i}-${level}`
        // if (!shouldRender(uuid)) return null
        return <WanderEnemy key={uuid} position={[x, 4, z]} uuid={uuid} color={enemyColor} destroyed={isDestroyed(uuid)} />
      })}
      {[...new Array(hunterEnemyCount)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 6)
        const uuid = `hunter-enemy-${i}-${level}`
        const fieldUuid = `hunter-field-${i}-${level}`
        // if (!shouldRender(uuid)) return null
        return <HunterEnemy key={uuid} position={[x, 4, z]} uuid={uuid} fieldUuid={fieldUuid} color={enemyColor} destroyed={isDestroyed(uuid)} />
      })}
      {[...new Array(shooterEnemyCount)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 8)
        const uuid = `shooter-enemy-${i}-${level}`
        return <ShooterEnemy key={uuid} position={[x, 2, z]} uuid={uuid} color={enemyColor} destroyed={isDestroyed(uuid)} />
      })}
    </Suspense>
  )
}

export default function App() {
  return (
    <Canvas
      shadows
      dpr={window.devicePixelRatio}
      camera={{ fov: isMobile() ? 30 : 25, position: [0, 40, 0] }}
      onCreated={(state) => {
        state.gl.setClearColor('black')
      }}
    >
      <StarsBackground />

      <Physics gravity={[0, -10, 0]}>
        {/* <Debug> */}
          <Scene />
        {/* </Debug> */}
      </Physics>

      <Menu />

      <Effects />
    </Canvas>
  )
}
