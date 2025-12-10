// API functions for Contexto game
export const loadGamesList = async (): Promise<Array<{
  id: number
  createdDate: string
  status: string
}>> => {
  try {
    const response = await fetch('/api/contexto/games')
    const data = await response.json()
    if (data.games) {
      const formattedGames = Object.entries(data.games)
        .reverse() // Show newest first
        .map(([id, gameData]) => {
          const gameId = Number(id)
          const gameInfo = gameData as { createdAt: string }
          // Format creation date
          const createdDate = new Date(gameInfo.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })

          // Get game status from local storage
          const getGameStatus = (id: number) => {
            if (typeof window === 'undefined') return "chưa chơi"

            try {
              const completedGames = JSON.parse(localStorage.getItem('contexto-completed-games') || '[]')

              if (completedGames.includes(id)) {
                return "đã hoàn thành"
              }

              // Check if there's progress for this game
              const progressKey = `contexto-progress-${id}`
              const progressData = localStorage.getItem(progressKey)

              if (progressData) {
                const progress = JSON.parse(progressData)

                // Check if game was given up
                if (progress.gameGaveUp) {
                  return "bỏ cuộc"
                }

                // If there are guesses, it's in progress
                if (progress.guesses && progress.guesses.length > 0) {
                  return "đang chơi"
                }
              }

              return "chưa chơi"
            } catch (error) {
              console.error('Error reading game status from localStorage:', error)
              return "chưa chơi"
            }
          }

          return {
            id: gameId,
            createdDate,
            status: getGameStatus(gameId)
          }
        })
      return formattedGames
    } else {
      console.error('❌ No games found in response')
      return []
    }
  } catch (error) {
    console.error('❌ Error loading games list:', error)
    return []
  }
}

// Fetch secret word from API (only when giving up)
export const fetchSecretWord = async (gameId: number): Promise<string | null> => {
  try {
    const response = await fetch(`/api/contexto?id=${gameId}&secret=true`)
    const data = await response.json()

    if (data.secretWord) {
      return data.secretWord
    }
  } catch (error) {
    console.error("Error fetching secret word:", error)
  }
  return null
}

// Process a guess
export const processGuess = async (gameNumber: number, guessWord: string): Promise<{ rank: number | null }> => {
  try {
    const response = await fetch(`/api/contexto?id=${gameNumber}&guess=${encodeURIComponent(guessWord)}`)
    const data = await response.json()
    return { rank: data.rank }
  } catch (error) {
    console.error("Error fetching guess result:", error)
    return { rank: null }
  }
}

// Get hint
export const getHint = async (gameNumber: number, lowestRank: number | null): Promise<{ hint: string; rank: number } | null> => {
  try {
    const url = `/api/contexto?id=${gameNumber}&hint=true${lowestRank ? `&lowestRank=${lowestRank}` : ''}`
    const response = await fetch(url)
    const data = await response.json()

    if (response.ok && data.hint) {
      return { hint: data.hint, rank: data.rank }
    } else {
      throw new Error(data.error || 'Unknown error')
    }
  } catch (error) {
    console.error('Error fetching hint:', error)
    throw error
  }
}

// Fetch closest words
export const fetchClosestWords = async (gameNumber: number, secretWord: string): Promise<Array<{ word: string; rank: number }>> => {
  try {
    const response = await fetch(`/api/contexto?id=${gameNumber}&closest=true&guess=${encodeURIComponent(secretWord)}`)
    const data = await response.json()

    if (data.closestWords) {
      return data.closestWords
    } else if (data.error) {
      console.error("Error fetching closest words:", data.error)
      return []
    }
  } catch (error) {
    console.error("Error fetching closest words:", error)
    return []
  }
  return []
}