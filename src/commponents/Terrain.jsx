import React from 'react'
import { Box, MeshReflectorMaterial } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

import { planeMaterial } from '../materials'
import { FLOOR_GROUP } from '../groups'

function Plane({ args, color, cannonArgs, ...props }) {
  const [ref] = useBox(() => ({ args: cannonArgs || args, ...props, material: planeMaterial, collisionFilterGroup: FLOOR_GROUP }))

  return (
    <Box args={args} ref={ref} castShadow receiveShadow>
      <meshPhongMaterial color={color} transparent opacity={0.5} />
    </Box>
  )
}

export function Terrain({ mapWidth, mapHeight }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[mapWidth, mapHeight]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={10}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="lightgreen"
          metalness={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>
      <Plane color="lightgreen" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[mapWidth, mapHeight, 0.1]} />

      <Plane
        color="lightgreen"
        position={[0, 0.5, -mapHeight / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, 0.1]}
        cannonArgs={[mapWidth, 15, 1]}
      />
      <Plane
        color="lightgreen"
        position={[0, 0.5, mapHeight / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, 0.1]}
        cannonArgs={[mapWidth, 15, 1]}
      />
      <Plane
        color="lightgreen"
        position={[-mapWidth / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, 0.1]}
        cannonArgs={[mapHeight, 15, 1]}
      />
      <Plane
        color="lightgreen"
        position={[mapWidth / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, 0.1]}
        cannonArgs={[mapHeight, 15, 1]}
      />
    </>
  )
}
