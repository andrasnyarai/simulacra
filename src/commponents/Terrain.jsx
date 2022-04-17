import React from 'react'
import { Box } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

import { PLANE_MATERIAL, FLOOR_GROUP } from '../constants'

function Plane({ args, cannonArgs, position, cannonPosition, rotation, color, ...props }) {
  const [ref] = useBox(() => ({
    args: cannonArgs || args,
    position: cannonPosition || position,
    material: PLANE_MATERIAL,
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

export function Terrain({ mapWidth, mapHeight, color }) {
  const wallThreeThickness = 0.1
  const wallCannonThickness = 5
  return (
    <>
      <Plane color={color} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[mapWidth, mapHeight, 0.1]} />

      <Plane
        color={color}
        position={[0, 0.5, -mapHeight / 2]}
        cannonPosition={[0, 0.5, -mapHeight / 2 - wallCannonThickness / 2 + wallThreeThickness / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, wallThreeThickness]}
        cannonArgs={[mapWidth + wallCannonThickness, 15, wallCannonThickness]}
      />
      <Plane
        color={color}
        position={[0, 0.5, mapHeight / 2]}
        cannonPosition={[0, 0.5, mapHeight / 2 + wallCannonThickness / 2 - wallThreeThickness / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, wallThreeThickness]}
        cannonArgs={[mapWidth + wallCannonThickness, 15, wallCannonThickness]}
      />
      <Plane
        color={color}
        position={[-mapWidth / 2, 0.5, 0]}
        cannonPosition={[-mapWidth / 2 - wallCannonThickness / 2 + wallThreeThickness / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, wallThreeThickness]}
        cannonArgs={[mapHeight + wallCannonThickness, 15, wallCannonThickness]}
      />
      <Plane
        color={color}
        position={[mapWidth / 2, 0.5, 0]}
        cannonPosition={[mapWidth / 2 + wallCannonThickness / 2 - wallThreeThickness / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, wallThreeThickness]}
        cannonArgs={[mapHeight + wallCannonThickness, 15, wallCannonThickness]}
      />
    </>
  )
}
