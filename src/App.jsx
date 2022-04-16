import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars as StarsBackground } from '@react-three/drei'
import { Physics, useContactMaterial, Debug } from '@react-three/cannon'

import { enemyMaterial, planeMaterial, playerMaterial } from './materials'
import { lerp } from './utils'
import { WanderEnemy } from './commponents/WanderEnemy'
import { HunterEnemy } from './commponents/HunterEnemy'
import { BlackHole } from './commponents/BlackHole'
import { Star } from './commponents/Star'
import { Obstacle } from './commponents/Obstacle'
import { Player } from './commponents/Player'
import { Terrain } from './commponents/Terrain'
import { Effects } from './commponents/Effects'
import { useStore } from './useStore'

function calculateStartingPosition(mapWidth, mapHeight, startOffset) {
  const offset = 2.5
  const width = mapWidth - offset
  const height = mapHeight - offset
  let x = lerp(Math.random(), -width / 2, width / 2)
  let z = lerp(Math.random(), -height / 2, height / 2)

  while (-startOffset < x && x < startOffset && -startOffset < z && z < startOffset) {
    x = lerp(Math.random(), -width / 2, width / 2)
  }

  return { x, z }
}

function ContactMaterials() {
  useContactMaterial(planeMaterial, playerMaterial)
  useContactMaterial(planeMaterial, enemyMaterial)

  return null
}

const Stars = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 2)

        return <Star key={`star-${i}-${level}`} position={[x, 3, z]} uuid={`star-${i}-${level}`} />
      })}
    </>
  )
})

const Obstacles = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 3)
        const size = lerp(Math.random(), 1, 3)

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

        return <WanderEnemy key={uuid} position={[x, 2, z]} uuid={uuid} />
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

        return <HunterEnemy key={uuid} position={[x, 2, z]} uuid={uuid} fieldUuid={fieldUuid} />
      })}
    </>
  )
})

export default function App() {
  const {
    level,
    collectedStars,
    isGateOpen,
    levelColor,
    mapWidth,
    mapHeight,
    starCount,
    obstacleCount,
    wanderEnemyCount,
    hunterEnemyCount,
    loadnNextLevel,
  } = useStore((state) => state)

  return (
    <Canvas camera={{ fov: 25, position: [0, 45, 0] }} shadows colorManagement onCreated={(state) => state.gl.setClearColor('black')}>
      <StarsBackground />
      {/* <OrbitControls /> */}

      <Physics gravity={[0, -10, 0]}>
        {/* <Debug scale={1.1}> */}
        <ContactMaterials />
        <scene key={level}>
          <Terrain mapWidth={mapWidth} mapHeight={mapHeight} color={levelColor} />

          <Stars mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={starCount} />
          <Obstacles mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={obstacleCount} />

          <WanderEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={wanderEnemyCount} />
          <HunterEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={hunterEnemyCount} />

          <BlackHole position={[0, 1, 0]} uuid={`black-hole`} isOpen={isGateOpen} />
          <Player position={[0, 1, 0]} uuid={`player`} />
        </scene>
        {/* </Debug> */}
      </Physics>
      <Effects />
    </Canvas>
  )
}
