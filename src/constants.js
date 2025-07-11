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
export const PROJECTILE_GROUP = 8

export const ENEMY_MOVEMENT_SPEED = isMobile() ? 0.75 : 1

export const RESPAWN_BLOCK_MS = 1000

export const POWERUP_CONFIGS = {
  Destroyer: { label: 'Destroyer', color: '#66ccff', weight: 0.3 },
  Collector: { label: 'Collector', color: '#ffe066', weight: 0.3 },
  Cleaner: { label: 'Cleaner', color: '#00081a', weight: 0.3 },
  // Mushroom: { label: 'Mushroom', color: '#00ff00', weight: 0.3 },
}

/**
 * Returns a powerup type based on a random number between 0 and 1,
 * using the weights defined in POWERUP_CONFIGS.
 * @param {number} rand - A random number between 0 and 1.
 * @returns {string} - The selected powerup type.
 */
export function getRandomPowerupType(rand) {
  // Build an array of { type, weight }
  const configs = Object.entries(POWERUP_CONFIGS).map(([type, config]) => ({
    type,
    weight: config.weight,
  }))
  // Calculate total weight
  const totalWeight = configs.reduce((sum, c) => sum + c.weight, 0)
  // Scale rand to totalWeight
  let r = rand * totalWeight
  for (let i = 0; i < configs.length; i++) {
    if (r < configs[i].weight) {
      return configs[i].type
    }
    r -= configs[i].weight
  }
  // Fallback (should not happen)
  return configs[configs.length - 1].type
}
