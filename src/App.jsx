import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars as StarsBackground } from '@react-three/drei'
import { Physics, useContactMaterial } from '@react-three/cannon'

import { ENEMY_MATERIAL, PLANE_MATERIAL, PLAYER_MATERIAL } from './constants'
import { isMobile, lerp, calculateStartingPosition, calculateNonOverlappingPositions } from './utils'
import { useStore } from './useStore'
import { Terrain } from './commponents/Terrain'
import { Player } from './commponents/Player'
import { Obstacle } from './commponents/Obstacle'
import { Star } from './commponents/Star'
import { WanderEnemy } from './commponents/WanderEnemy'
import { HunterEnemy } from './commponents/HunterEnemy'
import { SpinnerEnemy } from './commponents/SpinnerEnemy'
import { BlackHole } from './commponents/BlackHole'
import { Effects } from './commponents/Effects'
import { Menu } from './commponents/Menu'

const ObstaclesAndStars = React.memo(({ mapWidth, mapHeight, level, starCount, obstacleCount }) => {
  const objectDefinitions = [...new Array(obstacleCount)]
    .map(() => ({ type: 'OBSTACLE' }))
    .concat([...new Array(starCount)].map(() => ({ type: 'STAR' })))

  const positions = calculateNonOverlappingPositions(objectDefinitions, mapWidth, mapHeight)

  return (
    <>
      {positions
        .filter(({ type }) => type === 'STAR')
        .map(({ position: { x, z }, size }, i) => {
          const speed = lerp(Math.random(), 5, 20)

          return <Star key={`star-${i}-${level}`} position={[x, 1, z]} uuid={`star-${i}-${level}`} speed={speed} size={size} />
        })}
      {positions
        .filter(({ type }) => type === 'OBSTACLE')
        .map(({ position: { x, z }, size }, i) => {
          return <Obstacle key={`obstacle-${i}-${level}`} position={[x, size, z]} uuid={`obstacle-${i}-${level}`} size={size} />
        })}
    </>
  )
})

const WanderEnemies = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 5)
        const uuid = `wander-enemy-${i}-${level}`

        return <WanderEnemy key={uuid} position={[x, 4, z]} uuid={uuid} />
      })}
    </>
  )
})

const HunterEnemies = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 6)
        const uuid = `hunter-enemy-${i}-${level}`
        const fieldUuid = `hunter-field-${i}-${level}`

        return <HunterEnemy key={uuid} position={[x, 4, z]} uuid={uuid} fieldUuid={fieldUuid} />
      })}
    </>
  )
})

const SpinnerEnemies = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 6)
        const uuid = `spinner-enemy-${i}-${level}`
        const coreUuid = `spinner-enemy-core-${i}-${level}`

        return <SpinnerEnemy key={uuid} position={[x, 4, z]} uuid={uuid} coreUuid={coreUuid} />
      })}
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
    spinnerEnemyCount,
  } = useStore((state) => state)

  useContactMaterial(PLANE_MATERIAL, PLAYER_MATERIAL)
  useContactMaterial(PLANE_MATERIAL, ENEMY_MATERIAL)

  return (
    <Suspense fallback={null}>
      <Terrain mapWidth={mapWidth} mapHeight={mapHeight} color={levelColor} level={level} />

      <Player position={playerPosition} uuid={`player`} />
      <BlackHole position={[0, 1, 0]} uuid={`black-hole`} />

      <ObstaclesAndStars mapHeight={mapHeight} mapWidth={mapWidth} level={level} obstacleCount={obstacleCount} starCount={starCount} />

      <WanderEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={wanderEnemyCount} />
      <HunterEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={hunterEnemyCount} />
      <SpinnerEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={spinnerEnemyCount} />
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
        <Scene />
      </Physics>

      <Menu />

      <Effects />
    </Canvas>
  )
}
