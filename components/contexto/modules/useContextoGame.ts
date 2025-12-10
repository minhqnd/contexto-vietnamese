import { useState, useEffect, useCallback } from 'react'
import type { Guess, GameInfo } from './types'
import { loadGamesList, fetchSecretWord, processGuess, getHint, fetchClosestWords } from './api'
import { saveGameProgress, loadGameProgress, saveGameCompleted, getCompletedGames, getCurrentGame, setCurrentGame, checkAndResetStorage } from './storage'

export const useContextoGame = () => {
  // Game state
  const [secretWord, setSecretWord] = useState<string>("")
  const [currentGuess, setCurrentGuess] = useState("")
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [gameNumber, setGameNumber] = useState(1)
  const [hints, setHints] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null)
  const [gameCompletionTime, setGameCompletionTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameGaveUp, setGameGaveUp] = useState(false)
  const [lastGuessResult, setLastGuessResult] = useState<{ word: string; rank: number | null } | null>(null)
  const [showAlreadyGuessed, setShowAlreadyGuessed] = useState<string | null>(null)
  const [closestWords, setClosestWords] = useState<{ word: string; rank: number }[]>([])
  const [isLoadingClosest, setIsLoadingClosest] = useState(false)

  // UI state
  const [gamesList, setGamesList] = useState<GameInfo[]>([])
  const [hasAutoSelected, setHasAutoSelected] = useState(false)
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Check and reset storage on mount
  useEffect(() => {
    checkAndResetStorage()
  }, [])

  // Load games list
  const loadGames = useCallback(async () => {
    const games = await loadGamesList()
    setGamesList(games)
  }, [])

  // Auto-select game logic
  useEffect(() => {
    if (gamesList.length === 0 || hasAutoSelected) return

    const gameIds = gamesList.map(game => game.id).sort((a, b) => b - a)
    const latestGameId = gameIds[0] || 1

    if (typeof window === 'undefined') return

    try {
      let selectedGameId = latestGameId

      const completedGames = getCompletedGames()
      const currentGameId = getCurrentGame()
      
      if (currentGameId && gameIds.includes(currentGameId)) {
        // Kiểm tra xem game hiện tại có progress không
        const currentProgress = loadGameProgress(currentGameId)

        // Nếu game hiện tại đã hoàn thành, tìm game chưa chơi (ưu tiên game mới nhất)
        if (completedGames.includes(currentGameId)) {
          const unplayedGame = gameIds.find(gameId => !completedGames.includes(gameId))
          if (unplayedGame) {
            selectedGameId = unplayedGame
            setGameNumber(selectedGameId)
            setHasAutoSelected(true)
            setCurrentGame(selectedGameId)
            return
          }
          // Nếu tất cả games đã chơi, giữ game mới nhất
          selectedGameId = latestGameId
          setGameNumber(selectedGameId)
          setHasAutoSelected(true)
          setCurrentGame(selectedGameId)
          return
        }

        // Nếu chưa có progress (chưa chơi gì) và có game mới hơn, chuyển sang game mới
        if (!currentProgress || (currentProgress.guesses && currentProgress.guesses.length === 0)) {
          if (currentGameId < latestGameId) {
            selectedGameId = latestGameId
            setGameNumber(selectedGameId)
            setHasAutoSelected(true)
            setCurrentGame(selectedGameId)
            return
          }
        }

        // Nếu đã có progress và chưa hoàn thành, giữ nguyên game hiện tại
        selectedGameId = currentGameId
        setGameNumber(selectedGameId)
        setHasAutoSelected(true)
        return
      }

      // Nếu không có currentGameId hoặc không hợp lệ
      if (completedGames.includes(latestGameId)) {
        const unplayedGame = gameIds.find(gameId => !completedGames.includes(gameId))
        if (unplayedGame) {
          selectedGameId = unplayedGame
        }
      }

      setGameNumber(selectedGameId)
      setHasAutoSelected(true)
      setCurrentGame(selectedGameId)
    } catch (error) {
      console.error('Error in auto game selection:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }, [gamesList, hasAutoSelected])

  // Load game progress when game number changes
  useEffect(() => {
    if (gameNumber) {
      const progress = loadGameProgress(gameNumber)

      if (progress) {
        setGuesses(progress.guesses || [])
        setHints(progress.hints || 0)
        setGameWon(progress.gameWon || false)
        setGameGaveUp(progress.gameGaveUp || false)
        setGameCompletionTime(progress.gameCompletionTime || null)
        setSecretWord(progress.secretWord || "")

        if (progress.gameStartTime) {
          setGameStartTime(new Date(progress.gameStartTime))
        }
      } else {
        setGuesses([])
        setHints(0)
        setGameWon(false)
        setGameGaveUp(false)
        setGameCompletionTime(null)
        setSecretWord("")
        setGameStartTime(null)
      }

      setHasLoadedProgress(true)
    }
  }, [gameNumber])

  // Save progress whenever game state changes
  useEffect(() => {
    if (gameNumber && hasLoadedProgress && guesses.length > 0) {
      saveGameProgress(gameNumber, {
        guesses,
        hints,
        gameStartTime: gameStartTime?.toISOString() || null,
        gameWon,
        gameGaveUp,
        gameCompletionTime,
        secretWord
      })
    }
  }, [gameNumber, guesses, hints, gameStartTime, gameWon, gameGaveUp, gameCompletionTime, secretWord, hasLoadedProgress])

  // Process guess
  const handleProcessGuess = useCallback(async () => {
    if (!currentGuess.trim() || isLoading || gameWon || isInitialLoading) return

    const guessWord = currentGuess.trim().toLowerCase()

    if (guesses.length === 0 && !gameStartTime) {
      setGameStartTime(new Date())
    }

    const alreadyGuessed = guesses.find(guess => guess.word === guessWord)
    if (alreadyGuessed) {
      setShowAlreadyGuessed(guessWord)
      setCurrentGuess("")
      setTimeout(() => setShowAlreadyGuessed(null), 3000)
      return
    }

    setIsLoading(true)
    setTimeout(() => { }, 1500)

    try {
      const result = await processGuess(gameNumber, guessWord)

      setLastGuessResult({
        word: guessWord,
        rank: result.rank
      })

      if (result.rank === null) {
        setTimeout(() => setLastGuessResult(null), 2000)
      }

      if (result.rank !== null) {
        const newGuess: Guess = {
          word: guessWord,
          rank: result.rank,
        }

        setGuesses(prev => [...prev, newGuess])

        if (result.rank === 1) {
          if (gameStartTime) {
            const completionTime = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000)
            setGameCompletionTime(completionTime)
          }

          setGameWon(true)
          saveGameCompleted(gameNumber)
          if (!gameGaveUp) {
            setTimeout(() => {
              // confetti logic here
            }, 500)
          }
        }
      }

      setCurrentGuess("")
    } catch (error) {
      console.error("Error processing guess:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentGuess, isLoading, gameWon, isInitialLoading, guesses, gameStartTime, gameNumber, gameGaveUp])

  // Handle hint
  const handleHint = useCallback(async () => {
    if (gameWon || gameGaveUp || isInitialLoading) return

    try {
      const lowestRank = guesses.length > 0 ?
        Math.min(...guesses.filter(g => g.rank !== null).map(g => g.rank)) :
        null

      const hintResult = await getHint(gameNumber, lowestRank)

      if (hintResult) {
        const hintWord = hintResult.hint.trim().toLowerCase()

        // Bắt đầu game nếu đây là lần đầu
        if (guesses.length === 0 && !gameStartTime) {
          setGameStartTime(new Date())
        }

        // Kiểm tra đã guess chưa
        const alreadyGuessed = guesses.find(guess => guess.word === hintWord)
        if (alreadyGuessed) return

        // Thêm hint vào danh sách guess với rank đã có
        const newGuess: Guess = {
          word: hintWord,
          rank: hintResult.rank,
        }

        setGuesses(prev => [...prev, newGuess])
        setHints(prev => prev + 1)

        setLastGuessResult({
          word: hintWord,
          rank: hintResult.rank
        })

        // Kiểm tra thắng game
        if (hintResult.rank === 1) {
          if (gameStartTime) {
            const completionTime = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000)
            setGameCompletionTime(completionTime)
          }

          setGameWon(true)
          saveGameCompleted(gameNumber)
        }
      }
    } catch (error) {
      console.error('Error getting hint:', error)
      alert("⚠️ Có lỗi xảy ra khi lấy gợi ý. Vui lòng thử lại!")
    }
  }, [gameWon, gameGaveUp, isInitialLoading, guesses, gameStartTime, gameNumber])

  // Handle give up
  const handleGiveUp = useCallback(async () => {
    const secret = await fetchSecretWord(gameNumber)

    if (secret) {
      if (gameStartTime) {
        const completionTime = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000)
        setGameCompletionTime(completionTime)
      }

      const secretGuess: Guess = {
        word: secret,
        rank: 1,
      }
      setGuesses(prev => [...prev, secretGuess])
      setSecretWord(secret)
      setGameWon(true)
      setGameGaveUp(true)
      saveGameCompleted(gameNumber)
    }
  }, [gameNumber, gameStartTime])

  // Handle game selection
  const handleGameSelection = useCallback((selectedGameId: number, onClose?: () => void) => {
    setGameWon(false)
    setGameGaveUp(false)
    setGuesses([])
    setCurrentGuess("")
    setLastGuessResult(null)
    setShowAlreadyGuessed(null)
    setClosestWords([])
    setHints(0)
    setSecretWord("")
    setGameStartTime(null)
    setGameCompletionTime(null)
    setHasLoadedProgress(false)

    setGameNumber(selectedGameId)
    setCurrentGame(selectedGameId)

    // Close dialog after game selection
    onClose?.()
  }, [])

  // Handle random game
  const handleRandomGame = useCallback((onClose?: () => void) => {
    if (gamesList.length === 0 || isInitialLoading) return

    const completedGames = getCompletedGames()
    const unplayedGames = gamesList.filter(game =>
      game.id !== gameNumber && !completedGames.includes(game.id)
    )

    let targetGameId: number

    if (unplayedGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * unplayedGames.length)
      targetGameId = unplayedGames[randomIndex].id
    } else {
      const otherGames = gamesList.filter(game => game.id !== gameNumber)
      if (otherGames.length === 0) {
        alert("Bạn đang chơi game duy nhất có sẵn!")
        return
      }
      const randomIndex = Math.floor(Math.random() * otherGames.length)
      targetGameId = otherGames[randomIndex].id
    }

    handleGameSelection(targetGameId, onClose)
  }, [gamesList, isInitialLoading, gameNumber, handleGameSelection])

  // Load closest words
  const loadClosestWords = useCallback(async () => {
    if (closestWords.length > 0) return

    const secretGuess = guesses.find(g => g.rank === 1)
    if (!secretGuess) return

    setIsLoadingClosest(true)
    try {
      const words = await fetchClosestWords(gameNumber, secretGuess.word)
      setClosestWords(words)
    } catch (error) {
      console.error("Error loading closest words:", error)
    } finally {
      setIsLoadingClosest(false)
    }
  }, [closestWords.length, guesses, gameNumber])

  // Load closest words with secret word fetch
  const handleClosestWordsOpen = useCallback(async () => {
    if (!secretWord) {
      const fetchedSecret = await fetchSecretWord(gameNumber)
      if (fetchedSecret) {
        setSecretWord(fetchedSecret)
      }
    }
    loadClosestWords()
  }, [secretWord, gameNumber, loadClosestWords])

  // Initialize
  useEffect(() => {
    loadGames()
  }, [loadGames])

  return {
    // State
    secretWord,
    currentGuess,
    setCurrentGuess,
    guesses,
    gameNumber,
    hints,
    gameStartTime,
    gameCompletionTime,
    isLoading,
    gameWon,
    gameGaveUp,
    lastGuessResult,
    showAlreadyGuessed,
    closestWords,
    isLoadingClosest,
    gamesList,
    isInitialLoading,

    // Actions
    handleProcessGuess,
    handleHint,
    handleGiveUp,
    handleGameSelection,
    handleRandomGame,
    handleClosestWordsOpen,
    loadGames,
  }
}