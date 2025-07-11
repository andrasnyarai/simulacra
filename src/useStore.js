import create from 'zustand'
import { randomColor, randomDarkColor, randomNeonColor, randomPastelColor, randomWhiteYellowColor, randomBluishColor, randomReddishColor } from './utils'

// Generate a random color palette with custom generator
function generatePalette(count, generator) {
  return Array.from({ length: count }, () => generator())
}

function getLevelConfig(level, palettes) {
  // Difficulty scaling
  const easyLevels = 3
  const base = Math.floor(level / (easyLevels * 2)) // slower progression
  const difficulty = Math.max(1, base)

  // Map size grows even more slowly
  const mapBase = 20
  const mapGrowth = Math.min(60, mapBase + Math.floor(level * 1 + Math.random() * 2)) // slower growth
  const mapWidth = mapGrowth + Math.floor(Math.random() * 5)
  const mapHeight = mapGrowth + Math.floor(Math.random() * 5)

  // Color cycling from palettes
  const { levelColors, enemyColors, obstacleColors, starColors } = palettes
  const levelColor = levelColors[level % levelColors.length]
  const enemyColor = enemyColors[level % enemyColors.length]
  const obstacleColor = obstacleColors[level % obstacleColors.length]
  const starColor = starColors[level % starColors.length]

  // Star and obstacle count: easier start, slower increase
  const starCount = Math.max(3, Math.floor(5 + level * 0.7 + Math.random() * 3)) // easier and slower
  const obstacleCount = Math.max(1, Math.floor(2 + level * 0.7 + Math.random() * 2)) // easier and slower

  // Enemies scale up with level, but more slowly and start later
  const wanderEnemyCount = Math.floor(level / 4) + Math.floor(Math.random() * (difficulty)) // slower
  const hunterEnemyCount = level > 6 ? Math.floor(level / 8) + Math.floor(Math.random() * (difficulty)) : 0 // start later, slower
  const shooterEnemyCount = level > 10 ? Math.floor(level / 10) + Math.floor(Math.random() * (difficulty)) : 0 // shooter enemies
  // Layout pattern variety
  let layoutPattern = 'default'
  const varietyRoll = Math.random()
  if (varietyRoll > 0.85) layoutPattern = 'obstacle-maze'
  else if (varietyRoll > 0.65) layoutPattern = 'star-cluster'

  // Object/enemy type mix: specialType
  let specialType = null
  const specialRoll = Math.random()
  if (specialRoll > 0.97) specialType = 'powerup'
  else if (specialRoll > 0.92) specialType = 'rare-enemy'

  return {
    mapHeight,
    mapWidth,
    levelColor,
    enemyColor,
    obstacleColor,
    starColor,
    starCount,
    obstacleCount,
    wanderEnemyCount,
    hunterEnemyCount,
    shooterEnemyCount,
    layoutPattern,
    specialType,
  }
}

export { getLevelConfig }

function getInitialPalettes() {
  return {
    levelColors: generatePalette(30, randomDarkColor), // backgrounds: dark
    enemyColors: generatePalette(10, randomReddishColor), // enemies: red
    obstacleColors: generatePalette(10, randomBluishColor), // obstacles: blue
    starColors: generatePalette(8, randomWhiteYellowColor), // stars: white/yellow
  }
}

export const useStore = create((set, get) => {
  const initialLevel = 0
  const palettes = getInitialPalettes()
  const initialConfig = getLevelConfig(initialLevel, palettes)
  return {
    isPlayerAlive: true,
    lives: 3,
    level: initialLevel,
    playerPosition: [0, 0.5, 0],
    collectedStars: 0,
    collectedStarsOnLevel: 0,
    isGateOpen: false,
    isGameOver: false,
    isGameFinished: false,
    poweredUp: false,
    powerupColor: null,
    palettes,
    ...initialConfig,
    setPoweredUp: (value) => set(() => ({ poweredUp: value })),
    setPowerupColor: (color) => set(() => ({ powerupColor: color })),
    regeneratePalettes: () => {
      const newPalettes = getInitialPalettes()
      set({ palettes: newPalettes, ...getLevelConfig(0, newPalettes), level: 0 })
    },
    collectStar: () =>
      set((state) => ({
        collectedStarsOnLevel: state.collectedStarsOnLevel + 1,
        isGateOpen: state.collectedStarsOnLevel + 1 >= state.starCount,
      })),
    looseLife: () => set((state) => ({ lives: state.lives - 1, isPlayerAlive: false, isGameOver: state.lives - 1 <= 0, poweredUp: false })),
    restart: (playerPosition) => set(() => ({ isPlayerAlive: true, playerPosition, poweredUp: false })),
    loadNextLevel: () =>
      set((state) => {
        const nextLevel = state.level + 1
        return {
          level: nextLevel,
          isGateOpen: false,
          collectedStars: state.collectedStars + state.collectedStarsOnLevel,
          collectedStarsOnLevel: 0,
          isGameFinished: false, // never finished
          poweredUp: false,
          ...getLevelConfig(nextLevel, get().palettes),
        }
      }),
  }
})

export const initialState = useStore.getState()
