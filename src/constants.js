import { isMobile } from './utils'

export const PLANE_MATERIAL = { name: 'plane', restitution: 0, friction: 0 }
export const PLAYER_MATERIAL = { name: 'player', friction: 0.1 }
export const ENEMY_MATERIAL = { name: 'enemy', friction: 0.1 }

export const FLOOR_GROUP = 1
export const PLAYER_GROUP = 2
export const STAR_GROUP = 3
export const COLLECTED_STAR_GROUP = 4
export const ENEMY_GROUP = 5
export const OBSTACLE_GROUP = 6
export const BLACK_HOLE_GROUP = 7

export const ENEMY_MOVEMENT_SPEED = isMobile() ? 0.75 : 1

export const WIN_THRESHOLD = 0.75

export const RESPAWN_BLOCK_MS = 1000
