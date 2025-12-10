import type { GameProgress } from './types'

// Reset date - change this date to trigger a new reset
const RESET_DATE = '2024-12-06'

// Check and perform one-time reset if needed
export const checkAndResetStorage = () => {
  if (typeof window === 'undefined') return

  try {
    const lastResetDate = localStorage.getItem('contexto-last-reset')

    // If last reset date is different from current reset date, perform reset
    if (lastResetDate !== RESET_DATE) {
      console.log('Performing Contexto localStorage reset...')

      // Get all localStorage keys
      const keys = Object.keys(localStorage)

      // Remove all Contexto-related keys
      keys.forEach(key => {
        if (key.startsWith('contexto-')) {
          localStorage.removeItem(key)
        }
      })

      // Set the new reset date
      localStorage.setItem('contexto-last-reset', RESET_DATE)

      console.log('Contexto localStorage reset completed')
    }
  } catch (error) {
    console.error('Error during storage reset:', error)
  }
}

// Local storage utility functions
export const saveGameProgress = (gameId: number, progress: Partial<GameProgress>) => {
  if (typeof window === 'undefined') return

  try {
    const progressKey = `contexto-progress-${gameId}`
    const progressData = {
      guesses: progress.guesses || [],
      hints: progress.hints || 0,
      gameStartTime: progress.gameStartTime || null,
      gameWon: progress.gameWon || false,
      gameGaveUp: progress.gameGaveUp || false,
      gameCompletionTime: progress.gameCompletionTime || null,
      secretWord: progress.secretWord || "",
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(progressKey, JSON.stringify(progressData))
  } catch (error) {
    console.error('Error saving game progress:', error)
  }
}

export const loadGameProgress = (gameId: number): GameProgress | null => {
  if (typeof window === 'undefined') return null

  try {
    const progressKey = `contexto-progress-${gameId}`
    const progressData = localStorage.getItem(progressKey)
    if (progressData) {
      return JSON.parse(progressData)
    }
  } catch (error) {
    console.error('Error loading game progress:', error)
  }
  return null
}

export const saveGameCompleted = (gameId: number) => {
  if (typeof window === 'undefined') return

  try {
    const completedGames = JSON.parse(localStorage.getItem('contexto-completed-games') || '[]')
    if (!completedGames.includes(gameId)) {
      completedGames.push(gameId)
      localStorage.setItem('contexto-completed-games', JSON.stringify(completedGames))
    }
  } catch (error) {
    console.error('Error saving completed game status:', error)
  }
}

export const getCompletedGames = (): number[] => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(localStorage.getItem('contexto-completed-games') || '[]')
  } catch (error) {
    console.error('Error reading completed games:', error)
    return []
  }
}

export const getCurrentGame = (): number | null => {
  if (typeof window === 'undefined') return null

  try {
    const currentGameId = localStorage.getItem('contexto-current-game')
    return currentGameId ? parseInt(currentGameId) : null
  } catch (error) {
    console.error('Error reading current game:', error)
    return null
  }
}

export const setCurrentGame = (gameId: number) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('contexto-current-game', gameId.toString())
  } catch (error) {
    console.error('Error saving current game:', error)
  }
}