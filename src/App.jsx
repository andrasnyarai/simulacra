import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Physics, useContactMaterial, Debug } from '@react-three/cannon'

import { enemyMaterial, planeMaterial, playerMaterial } from './materials'
import { STAR_COUNT, OBSTACLE_COUNT, WANDER_ENEMY_COUNT, HUNTER_ENEMY_COUNT } from './mapConstants'
import { lerp } from './utils'
import { WanderEnemy } from './commponents/WanderEnemy'
import { HunterEnemy } from './commponents/HunterEnemy'
import { Star } from './commponents/Star'
import { Obstacle } from './commponents/Obstacle'
import { Player } from './commponents/Player'
import { Terrain } from './commponents/Terrain'
import { Effects } from './commponents/Effects'

// user select none to everything
// add context black hole only visible when done
// end game level
// levels -- differ size enemycount starcount color
// disable history back
// messenger browser contain overtouch scroll

// 3 lifes
// powerup pacman +1 life
// sounds
// useloader for game start
// specify colors
// add domain
// create svg favicon
// og pictures !
// menu
// leaderboard -> highscoard based on time
// extend api with removebody

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

        {[...new Array(STAR_COUNT)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 2)
          return <Star key={`star-${i}`} position={[x, 3, z]} uuid={`star-${i}`} />
        })}

        {[...new Array(OBSTACLE_COUNT)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 3)
          return <Obstacle key={`obstacle-${i}`} position={[x, 0.5, z]} />
        })}

        {[...new Array(WANDER_ENEMY_COUNT)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight, 5)
          const uuid = `wander-enemy-${i}`

          return <WanderEnemy key={uuid} position={[x, 2, z]} uuid={uuid} />
        })}

        {[...new Array(HUNTER_ENEMY_COUNT)].map((_, i) => {
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
