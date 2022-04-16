import React from 'react'
import { Box, MeshReflectorMaterial } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

import { planeMaterial } from '../materials'
import { FLOOR_GROUP } from '../groups'

function Plane({ args, cannonArgs, position, cannonPosition, rotation, color, ...props }) {
  const [ref] = useBox(() => ({
    args: cannonArgs || args,
    position: cannonPosition || position,
    material: planeMaterial,
    rotation,
    collisionFilterGroup: FLOOR_GROUP,
    ...props,
  }))

  return (
    <Box args={args} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhongMaterial color={color} transparent opacity={0.5} />
    </Box>
  )
}

export function Terrain({ mapWidth, mapHeight }) {
  const wallThreeThickness = 0.1
  const wallCannonThickness = 5
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
        cannonPosition={[0, 0.5, -mapHeight / 2 - wallCannonThickness / 2 + wallThreeThickness / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, wallThreeThickness]}
        cannonArgs={[mapWidth + wallCannonThickness, 15, wallCannonThickness]}
      />
      <Plane
        color="lightgreen"
        position={[0, 0.5, mapHeight / 2]}
        cannonPosition={[0, 0.5, mapHeight / 2 + wallCannonThickness / 2 - wallThreeThickness / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, wallThreeThickness]}
        cannonArgs={[mapWidth + wallCannonThickness, 15, wallCannonThickness]}
      />
      <Plane
        color="lightgreen"
        position={[-mapWidth / 2, 0.5, 0]}
        cannonPosition={[-mapWidth / 2 - wallCannonThickness / 2 + wallThreeThickness / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, wallThreeThickness]}
        cannonArgs={[mapHeight + wallCannonThickness, 15, wallCannonThickness]}
      />
      <Plane
        color="lightgreen"
        position={[mapWidth / 2, 0.5, 0]}
        cannonPosition={[mapWidth / 2 + wallCannonThickness / 2 - wallThreeThickness / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, wallThreeThickness]}
        cannonArgs={[mapHeight + wallCannonThickness, 15, wallCannonThickness]}
      />
    </>
  )
}
