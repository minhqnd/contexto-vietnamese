"use client"

import { AnimatePresence, motion } from "framer-motion"
import { getBarStyle } from "./utils"
import type { Guess } from "./types"

interface GuessesListProps {
  guesses: Guess[]
  gameWon: boolean
}

export default function GuessesList({ guesses, gameWon }: GuessesListProps) {
  if (guesses.length === 0) return null

  const sortedGuesses = [...guesses].sort((a, b) => a.rank - b.rank)

  return (
    <div className="mb-6 space-y-2 max-w-xl mx-auto">
      <AnimatePresence>
        {sortedGuesses
          .filter(guess => !gameWon || guess.rank !== 1) // Hide rank 1 when game is won
          .map((guess, index) => {
            const { color, width } = getBarStyle(guess.rank)
            const isLatestGuess = guess.word === guesses[guesses.length - 1]?.word
            return (
              <motion.div
                key={`${guess.word}-${guess.rank}`}
                className={`relative bg-white dark:bg-neutral-700 rounded-2xl overflow-hidden shadow-lg ${isLatestGuess ? "border-[3px] border-neutral-800 dark:border-neutral-50" : ""}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <motion.div
                  className={`${color} h-10 rounded-xl flex items-center px-4`}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                >
                  <span className={`${isLatestGuess ? " font-black" : "font-semibold"} text-neutral-800 dark:text-neutral-100 text-lg whitespace-nowrap`}>{guess.word}</span>
                </motion.div>
                <motion.span
                  className={`${isLatestGuess ? " font-black" : "font-semibold"} absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-800 dark:text-neutral-50 text-lg tabular-nums  px-2 py-1 rounded-lg`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                >
                  {guess.rank}
                </motion.span>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </div>
  )
}