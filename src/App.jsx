import React, { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Box, OrbitControls, Sphere, Trail, Stars, MeshReflectorMaterial, MeshWobbleMaterial } from '@react-three/drei'
import { Physics, usePlane, useSphere, useBox, useContactMaterial, Debug } from '@react-three/cannon'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { animated, useSpring } from '@react-spring/three'

import { enemyMaterial, planeMaterial, playerMaterial } from './materials'
import { Enemy } from './commponents/Enemy'
import { Star } from './commponents/Star'
import { Obstacle } from './commponents/Obstacle'
import { Player } from './commponents/Player'
import { Terrain } from './commponents/Terrain'
import { lerp } from './utils'

// specify materials and iteractions
// specify colors

function ContactMaterials() {
  useContactMaterial(planeMaterial, playerMaterial, { friction: 0, restitution: 0.5 })
  useContactMaterial(planeMaterial, enemyMaterial, { friction: 0, restitution: 0.5 })

  return null
}

export default function App() {
  const mapWidth = 30
  const mapHeight = 15

  return (
    <Canvas camera={{ fov: 25, position: [0, 45, 10] }} shadows colorManagement onCreated={(state) => state.gl.setClearColor('black')}>
      <Stars />
      <OrbitControls />

      <Physics gravity={[0, -10, 0]}>
        {/* <Debug scale={1.1}> */}
        <ContactMaterials />
        <Terrain mapWidth={mapWidth} mapHeight={mapHeight} />

        {[...new Array(10)].map((_, i) => {
          const offset = 2.5
          const width = mapWidth - offset
          const height = mapHeight - offset
          const x = lerp(Math.random(), -width / 2, width / 2)
          const z = lerp(Math.random(), -height / 2, height / 2)
          return <Obstacle key={`obstacle-${i}`} position={[x, 0.5, z]} />
        })}

        {[...new Array(30)].map((_, i) => {
          const offset = 2.5
          const width = mapWidth - offset
          const height = mapHeight - offset
          const x = lerp(Math.random(), -width / 2, width / 2)
          const z = lerp(Math.random(), -height / 2, height / 2)
          return <Star key={`star-${i}`} position={[x, 1, z]} uuid={`star-${i}`} />
        })}

        {[...new Array(5)].map((_, i) => {
          const offset = 2.5
          const width = mapWidth - offset
          const height = mapHeight - offset
          const x = lerp(Math.random(), -width / 2, width / 2)
          const z = lerp(Math.random(), -height / 2, height / 2)
          const uuid = `enemy-${i}`
          return <Enemy key={uuid} position={[x, 2, z]} uuid={uuid} />
        })}

        <Player position={[0, 3, 0]} />
        {/* </Debug> */}
      </Physics>

      <ambientLight intensity={0.05} color="yellow" />
    </Canvas>
  )
}
