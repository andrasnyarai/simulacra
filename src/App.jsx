import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Physics, useContactMaterial, Debug } from '@react-three/cannon'

import { enemyMaterial, planeMaterial, playerMaterial } from './materials'
import { lerp } from './utils'
import { Enemy } from './commponents/Enemy'
import { Star } from './commponents/Star'
import { Obstacle } from './commponents/Obstacle'
import { Player } from './commponents/Player'
import { Terrain } from './commponents/Terrain'

// specify colors
// mobile controls/arrow controls/ mouse controls
// add domain
// html metadata
// some ui starcount etc...

// game end logic (death/black hole gate)
// different levels
// sounds
// effects

// invincible spawn
// life damage
// pacman powerup -> life

// purple enemy attracts you
// Orb enemy spawns little ones

const starCount = 30
const obstacleCount = 10
const enemyCount = 5

function calculateStartingPosition(mapWidth, mapHeight) {
  const offset = 2.5
  const width = mapWidth - offset
  const height = mapHeight - offset
  const x = lerp(Math.random(), -width / 2, width / 2)
  const z = lerp(Math.random(), -height / 2, height / 2)
  return { x, z }
}

function ContactMaterials() {
  useContactMaterial(planeMaterial, playerMaterial)
  useContactMaterial(planeMaterial, enemyMaterial)

  return null
}

export default function App() {
  const mapWidth = 30
  const mapHeight = 15

  return (
    <Canvas camera={{ fov: 25, position: [0, 45, 10] }} shadows colorManagement onCreated={(state) => state.gl.setClearColor('black')}>
      <Stars />
      <ambientLight intensity={0.05} color="white" />
      <OrbitControls />

      <Physics gravity={[0, -10, 0]}>
        {/* <Debug scale={1.1}> */}

        <ContactMaterials />
        <Terrain mapWidth={mapWidth} mapHeight={mapHeight} />

        {[...new Array(starCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight)
          return <Star key={`star-${i}`} position={[x, 1, z]} uuid={`star-${i}`} />
        })}

        {[...new Array(obstacleCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight)
          return <Obstacle key={`obstacle-${i}`} position={[x, 0.5, z]} />
        })}

        {[...new Array(enemyCount)].map((_, i) => {
          const { x, z } = calculateStartingPosition(mapWidth, mapHeight)
          const uuid = `enemy-${i}`
          return <Enemy key={uuid} position={[x, 2, z]} uuid={uuid} />
        })}
        <Player position={[0, 3, 0]} />
        {/* </Debug> */}
      </Physics>
    </Canvas>
  )
}
