import React, { useEffect, useRef } from 'react'
import { Box } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

import { PLANE_MATERIAL, FLOOR_GROUP, RESPAWN_BLOCK_MS } from '../constants'
import { initialState, useStore } from '../useStore'

function Plane({ args, cannonArgs, position, cannonPosition, rotation, color, onClick = () => {}, ...props }) {
  useBox(() => ({
    args: cannonArgs || args,
    position: cannonPosition || position,
    material: PLANE_MATERIAL,
    rotation,
    collisionFilterGroup: FLOOR_GROUP,
    ...props,
  }))

  return (
    <Box args={args} position={position} rotation={rotation} uuid={props.uuid} castShadow receiveShadow onClick={onClick}>
      <meshStandardMaterial color={color} opacity={0.9} transparent  depthWrite={false} />
    </Box>
  )
}

export function Terrain({ mapWidth, mapHeight, color, level }) {
  const { restart, isPlayerAlive, isGameOver } = useStore((state) => state)

  const wallThreeThickness = 0.1
  const wallCannonThickness = 5

  const floorThreeThickness = 0.1
  const floorCannonThickness = 5

  const uuid = `terrain-${level}`

  const respawnBlock = useRef(false)

  useEffect(() => {
    async function blockRespawn() {
      respawnBlock.current = true
      await new Promise((res) => setTimeout(res, RESPAWN_BLOCK_MS))
      respawnBlock.current = false
    }

    if (!isPlayerAlive) blockRespawn()
  }, [isPlayerAlive])

  return (
    <scene key={uuid}>
      <Plane
        onClick={({ point }) => {
          if (isPlayerAlive || respawnBlock.current) return
          const [x, , z] = point
          isGameOver ? useStore.setState(initialState, true) : restart([x, 0.5, z])
        }}
        color={color}
        position={[0, 0, 0]}
        cannonPosition={[0, -floorCannonThickness / 2 + floorThreeThickness / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[mapWidth, mapHeight, floorThreeThickness]}
        cannonArgs={[mapWidth, mapHeight, floorCannonThickness]}
        receiveShadow
      />

      <Plane
        color={color}
        position={[0, 0.5, -mapHeight / 2]}
        cannonPosition={[0, 0.5, -mapHeight / 2 - wallCannonThickness / 2 + wallThreeThickness / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, wallThreeThickness]}
        cannonArgs={[mapWidth + wallCannonThickness, 15, wallCannonThickness]}
        receiveShadow
      />
      <Plane
        color={color}
        position={[0, 0.5, mapHeight / 2]}
        cannonPosition={[0, 0.5, mapHeight / 2 + wallCannonThickness / 2 - wallThreeThickness / 2]}
        rotation={[0, 0, 0]}
        args={[mapWidth, 1, wallThreeThickness]}
        cannonArgs={[mapWidth + wallCannonThickness, 15, wallCannonThickness]}
        receiveShadow
      />
      <Plane
        color={color}
        position={[-mapWidth / 2, 0.5, 0]}
        cannonPosition={[-mapWidth / 2 - wallCannonThickness / 2 + wallThreeThickness / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, wallThreeThickness]}
        cannonArgs={[mapHeight + wallCannonThickness, 15, wallCannonThickness]}
        receiveShadow
      />
      <Plane
        color={color}
        position={[mapWidth / 2, 0.5, 0]}
        cannonPosition={[mapWidth / 2 + wallCannonThickness / 2 - wallThreeThickness / 2, 0.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[mapHeight, 1, wallThreeThickness]}
        cannonArgs={[mapHeight + wallCannonThickness, 15, wallCannonThickness]}
        receiveShadow
      />

      {/* Thin boxes on top of walls to mark boundaries */}
      <Box position={[0, 1, -mapHeight/2]} args={[mapWidth, 0.05, 0.05]}>
        <meshBasicMaterial color={color} />
      </Box>
      <Box position={[0, 1, mapHeight/2]} args={[mapWidth, 0.05, 0.05]}>
        <meshBasicMaterial color={color} />
      </Box>
      <Box position={[mapWidth/2, 1, 0]} args={[0.05, 0.05, mapHeight]}>
        <meshBasicMaterial color={color} />
      </Box>
      <Box position={[-mapWidth/2, 1, 0]} args={[0.05, 0.05, mapHeight]}>
        <meshBasicMaterial color={color} />
      </Box>
    </scene>
  )
}
