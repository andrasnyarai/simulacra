import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars as StarsBackground, OrbitControls } from '@react-three/drei'
import { Physics, useContactMaterial, Debug } from '@react-three/cannon'

import { ENEMY_MATERIAL, PLANE_MATERIAL, PLAYER_MATERIAL } from './constants'
import { isMobile, lerp } from './utils'
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
  useContactMaterial(PLANE_MATERIAL, PLAYER_MATERIAL)
  useContactMaterial(PLANE_MATERIAL, ENEMY_MATERIAL)

  return null
}

const Stars = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 2)
        const speed = lerp(Math.random(), 1, 6)

        return <Star key={`star-${i}-${level}`} position={[x, 3, z]} uuid={`star-${i}-${level}`} speed={speed} />
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

const SpinnerEnemies = React.memo(({ mapWidth, mapHeight, level, count }) => {
  return (
    <>
      {[...new Array(count)].map((_, i) => {
        const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 6)
        const uuid = `spinner-enemy-${i}-${level}`
        const coreUuid = `spinner-enemy-core-${i}-${level}`

        return <SpinnerEnemy key={uuid} position={[x, 2, z]} uuid={uuid} coreUuid={coreUuid} />
      })}
    </>
  )
})

export default function App() {
  const {
    level,
    lives,
    isGateOpen,
    levelColor,
    mapWidth,
    mapHeight,
    starCount,
    collectedStarsOnLevel,
    obstacleCount,
    wanderEnemyCount,
    hunterEnemyCount,
    spinnerEnemyCount,
    isPlayerAlive,
  } = useStore((state) => state)

  return (
    <>
      <div style={{ position: 'absolute', color: 'white', zIndex: 1, fontSize: 20 }}>
        ⭐{collectedStarsOnLevel}/{starCount} ❤️{lives} 🗺️{level + 1}
      </div>
      <Canvas
        dpr={1}
        camera={{ fov: isMobile() ? 30 : 25, position: [0, 40, 0] }}
        shadows
        onCreated={(state) => state.gl.setClearColor('black')}
      >
        <StarsBackground />
        {/* <OrbitControls /> */}

        <Physics gravity={[0, -10, 0]}>
          {/* <Debug scale={1.1}> */}
          <ContactMaterials />

          <scene key={level}>
            <Terrain mapWidth={mapWidth} mapHeight={mapHeight} color={levelColor} level={level} />
          </scene>

          <Player position={[0, 1, 0]} uuid={`player`} />
          <BlackHole position={[0, 1, 0]} uuid={`black-hole`} isOpen={isGateOpen} />

          <Stars mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={starCount} />
          <Obstacles mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={obstacleCount} />

          <WanderEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={wanderEnemyCount} />
          <HunterEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={hunterEnemyCount} />
          <SpinnerEnemies mapHeight={mapHeight} mapWidth={mapWidth} level={level} count={spinnerEnemyCount} />

          {/*  dont pass down you can have it inside the compontn `isGateOpen` */}

          {/* </scene> */}
          {/* </Debug> */}
        </Physics>
        <Menu />
        {/* <Effects /> */}
      </Canvas>
    </>
  )
}
