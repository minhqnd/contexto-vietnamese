"use client"

import { useState } from "react"

// Import modules
import { useContextoGame } from "./modules/useContextoGame"
import Header from "./modules/Header"
import InputSection from "./modules/InputSection"
import GuessDisplay from "./modules/GuessDisplay"
import TutorialCard from "./modules/TutorialCard"
import WinScreen from "./modules/WinScreen"
import GuessesList from "./modules/GuessesList"
import HowToPlayDialog from "./modules/HowToPlayDialog"
import GiveUpDialog from "./modules/GiveUpDialog"
import GameSelectionDialog from "./modules/GameSelectionDialog"
import FaqDialog from "./modules/FaqDialog"

export default function Component() {
  // Dialog states
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [giveUpDialogOpen, setGiveUpDialogOpen] = useState(false)
  const [gameSelectionDialogOpen, setGameSelectionDialogOpen] = useState(false)
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)

  // Use the game hook
  const {
    secretWord,
    currentGuess,
    setCurrentGuess,
    guesses,
    gameNumber,
    hints,
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
    handleProcessGuess,
    handleHint,
    handleGiveUp,
    handleGameSelection,
    handleRandomGame,
    handleClosestWordsOpen,
    loadGames,
  } = useContextoGame()

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleProcessGuess()
    }
  }

  // Handle give up confirmation
  const confirmGiveUp = async () => {
    await handleGiveUp()
    setGiveUpDialogOpen(false)
  }

  // Handle game selection dialog
  const handleGameSelectionDialog = (open: boolean) => {
    setGameSelectionDialogOpen(open)
    if (open) {
      loadGames()
    }
  }

  // Handle game selection with dialog close
  const handleGameSelectionWithClose = (gameId: number) => {
    handleGameSelection(gameId, () => setGameSelectionDialogOpen(false))
  }

  // Handle random game with dialog close
  const handleRandomGameWithClose = () => {
    handleRandomGame(() => setGameSelectionDialogOpen(false))
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-neutral-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <Header
          gameNumber={gameNumber}
          guessesLength={guesses.length}
          hints={hints}
          isInitialLoading={isInitialLoading}
          gameWon={gameWon}
          gameGaveUp={gameGaveUp}
          onShowHowToPlay={() => setShowHowToPlay(true)}
          onHint={handleHint}
          onGiveUp={() => setGiveUpDialogOpen(true)}
          onGameSelection={() => handleGameSelectionDialog(true)}
        />

        {/* How To Play Dialog */}
        <HowToPlayDialog
          open={showHowToPlay}
          onOpenChange={setShowHowToPlay}
        />

        {/* Give Up Dialog */}
        <GiveUpDialog
          open={giveUpDialogOpen}
          onOpenChange={setGiveUpDialogOpen}
          guessesLength={guesses.length}
          onConfirmGiveUp={confirmGiveUp}
        />

        {/* Input Section */}
        <InputSection
          currentGuess={currentGuess}
          setCurrentGuess={setCurrentGuess}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          isInitialLoading={isInitialLoading}
          gameWon={gameWon}
          gameGaveUp={gameGaveUp}
        />

        {/* Latest Guess Display */}
        <GuessDisplay
          isLoading={isLoading}
          showAlreadyGuessed={showAlreadyGuessed}
          lastGuessResult={lastGuessResult}
          guesses={guesses}
        />

        {/* Tutorial Card for first-time users */}
        {guesses.length === 0 && (
          <TutorialCard onFaqDialogOpen={() => setFaqDialogOpen(true)} />
        )}

        {/* Win/Give Up Screen */}
        <WinScreen
          gameWon={gameWon}
          gameGaveUp={gameGaveUp}
          secretWord={secretWord}
          guesses={guesses}
          gameCompletionTime={gameCompletionTime}
          hints={hints}
          onGameSelection={() => handleGameSelectionDialog(true)}
          onClosestWordsOpen={handleClosestWordsOpen}
          closestWords={closestWords}
          isLoadingClosest={isLoadingClosest}
        />

        {/* Sorted Guesses List */}
        <GuessesList guesses={guesses} gameWon={gameWon} />

        {/* Game Selection Dialog */}
        <GameSelectionDialog
          open={gameSelectionDialogOpen}
          onOpenChange={handleGameSelectionDialog}
          gamesList={gamesList}
          currentGameNumber={gameNumber}
          isInitialLoading={isInitialLoading}
          onGameSelection={handleGameSelectionWithClose}
          onRandomGame={handleRandomGameWithClose}
        />

        {/* FAQ Dialog */}
        <FaqDialog
          open={faqDialogOpen}
          onOpenChange={setFaqDialogOpen}
        />
      </div>
    </div>
  )
}
