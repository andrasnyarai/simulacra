import create from 'zustand'

const winThreshold = 0.75
// 4 world 4 levels each
const levels = [
  { mapHeight: 20, mapWidth: 20, levelColor: 'forestgreen', starCount: 10, obstacleCount: 5, wanderEnemyCount: 0, hunterEnemyCount: 0 },
  { mapHeight: 20, mapWidth: 20, levelColor: 'forestgreen', starCount: 15, obstacleCount: 15, wanderEnemyCount: 1, hunterEnemyCount: 0 },
  { mapHeight: 30, mapWidth: 30, levelColor: 'forestgreen', starCount: 30, obstacleCount: 25, wanderEnemyCount: 2, hunterEnemyCount: 0 },
  { mapHeight: 20, mapWidth: 40, levelColor: 'forestgreen', starCount: 30, obstacleCount: 20, wanderEnemyCount: 5, hunterEnemyCount: 0 },

  { mapHeight: 50, mapWidth: 50, levelColor: 'blue', starCount: 15, obstacleCount: 15, wanderEnemyCount: 8, hunterEnemyCount: 1 },
  { mapHeight: 20, mapWidth: 80, levelColor: 'blue', starCount: 20, obstacleCount: 30, wanderEnemyCount: 8, hunterEnemyCount: 1 },
  { mapHeight: 60, mapWidth: 60, levelColor: 'blue', starCount: 40, obstacleCount: 5, wanderEnemyCount: 6, hunterEnemyCount: 2 },
  { mapHeight: 100, mapWidth: 20, levelColor: 'blue', starCount: 50, obstacleCount: 25, wanderEnemyCount: 10, hunterEnemyCount: 2 },

  { mapHeight: 40, mapWidth: 40, levelColor: 'indigo', starCount: 20, obstacleCount: 5, wanderEnemyCount: 0, hunterEnemyCount: 4 },
  { mapHeight: 35, mapWidth: 45, levelColor: 'indigo', starCount: 25, obstacleCount: 0, wanderEnemyCount: 7, hunterEnemyCount: 2 },
  { mapHeight: 40, mapWidth: 50, levelColor: 'indigo', starCount: 10, obstacleCount: 8, wanderEnemyCount: 15, hunterEnemyCount: 0 },
  { mapHeight: 20, mapWidth: 20, levelColor: 'indigo', starCount: 10, obstacleCount: 2, wanderEnemyCount: 3, hunterEnemyCount: 3 },

  { mapHeight: 20, mapWidth: 120, levelColor: 'maroon', starCount: 28, obstacleCount: 30, wanderEnemyCount: 25, hunterEnemyCount: 2 },
  // { mapHeight: 50, mapWidth: 50, levelColor: 'maroon', starCount: 5, obstacleCount: 5, wanderEnemyCount: 1, hunterEnemyCount: 1 },
  // { mapHeight: 50, mapWidth: 50, levelColor: 'maroon', starCount: 5, obstacleCount: 5, wanderEnemyCount: 1, hunterEnemyCount: 1 },
  // { mapHeight: 50, mapWidth: 50, levelColor: 'maroon', starCount: 5, obstacleCount: 5, wanderEnemyCount: 1, hunterEnemyCount: 1 },
]

export const useStore = create((set) => ({
  isGateOpen: false,
  level: 0,
  collectedStars: 0,
  collectStar: () =>
    set((state) => ({ collectedStars: state.collectedStars + 1, isGateOpen: state.collectedStars + 1 > state.starCount * winThreshold })),
  ...levels[0],
  loadnNextLevel: () =>
    set((state) => ({
      level: state.level + 1,
      isGateOpen: false,
      collectedStars: 0,
      ...levels[state.level + 1],
    })),
}))
