import create from 'zustand'

const winThreshold = 0.75

const levels = [
  { mapHeight: 20, mapWidth: 20, levelColor: 'lightgreen', starCount: 10, obstacleCount: 5, wanderEnemyCount: 0, hunterEnemyCount: 0 },
  { mapHeight: 30, mapWidth: 30, levelColor: 'blue', starCount: 20, obstacleCount: 10, wanderEnemyCount: 1, hunterEnemyCount: 0 },
  { mapHeight: 40, mapWidth: 40, levelColor: 'lightpink', starCount: 30, obstacleCount: 15, wanderEnemyCount: 2, hunterEnemyCount: 1 },
  { mapHeight: 50, mapWidth: 50, levelColor: 'red', starCount: 40, obstacleCount: 20, wanderEnemyCount: 3, hunterEnemyCount: 2 },
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
