import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Physics, useContactMaterial, Debug } from '@react-three/cannon'

import { enemyMaterial, planeMaterial, playerMaterial } from './materials'
import { lerp } from './utils'
import { WanderEnemy } from './commponents/WanderEnemy'
import { HunterEnemy } from './commponents/HunterEnemy'
import { Star } from './commponents/Star'
import { Obstacle } from './commponents/Obstacle'
import { Player } from './commponents/Player'
import { Terrain } from './commponents/Terrain'
import { Effects } from './commponents/Effects'

// user select none to everything

//  if mobile no FLoorReflection
// game end logic (death/black hole gate)
// levels
// 3 lifes
// sounds
// pacman powerup -> life
// some ui starcount etc...
// useloader for game start

// specify colors
// add domain
// create svg favicon
// og pictures !

// menu
// leaderboard

// extend api with removebody

const starCount = 30
const obstacleCount = 10
const wanderEnemyCount = 3
const hunterEnemyCount = 2

const mapWidth = 30
const mapHeight = 30

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

export default function App() {
  return (
    <Canvas camera={{ fov: 25, position: [0, 45, 0] }} shadows colorManagement onCreated={(state) => state.gl.setClearColor('black')}>
      <Stars />
      {/* <OrbitControls /> */}

      <Physics gravity={[0, -10, 0]}>
        {/* <Debug scale={1.1}> */}
        <ContactMaterials />
        <Terrain mapWidth={mapWidth} mapHeight={mapHeight} />

        {[...new Array(starCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 2)
          return <Star key={`star-${i}`} position={[x, 3, z]} uuid={`star-${i}`} />
        })}

        {[...new Array(obstacleCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 3)
          return <Obstacle key={`obstacle-${i}`} position={[x, 0.5, z]} />
        })}

        {[...new Array(wanderEnemyCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 5)
          const uuid = `wander-enemy-${i}`

          return <WanderEnemy key={uuid} position={[x, 2, z]} uuid={uuid} />
        })}

        {[...new Array(hunterEnemyCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 6)
          const uuid = `hunter-enemy-${i}`
          const fieldUuid = `hunter-field-${i}`
          return <HunterEnemy key={uuid} position={[x, 2, z]} uuid={uuid} fieldUuid={fieldUuid} />
        })}

        <Player position={[0, 1, 0]} />
        {/* </Debug> */}
      </Physics>
      <Effects />
    </Canvas>
  )
}
