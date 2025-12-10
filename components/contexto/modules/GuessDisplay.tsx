"use client"

import { motion } from "framer-motion"
import { getBarStyle } from "./utils"

interface GuessDisplayProps {
    isLoading: boolean
    showAlreadyGuessed: string | null
    lastGuessResult: { word: string; rank: number | null } | null
    guesses: Array<{ word: string; rank: number }>
}

export default function GuessDisplay({
    isLoading,
    showAlreadyGuessed,
    lastGuessResult,
    guesses,
}: GuessDisplayProps) {
    if (!isLoading && !showAlreadyGuessed && (!lastGuessResult || lastGuessResult.rank !== null) && guesses.length === 0) {
        return null
    }

    return (
        <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-lg max-w-xl mx-auto border-[3px] border-neutral-800 dark:border-neutral-300">
                {/* Loading state */}
                {isLoading ? (
                    <div className="bg-blue-100 dark:bg-blue-400 h-10 rounded-xl flex items-center justify-center px-4">
                        <span className="font-black text-blue-800 dark:text-blue-50 text-lg flex gap-0.5">
                            {["Đ", "a", "n", "g", " ", "t", "í", "n", "h", " ", "t", "o", "á", "n", ".", ".", "."].map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ y: 0 }}
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{
                                        duration: 0.3,
                                        repeat: Infinity,
                                        repeatDelay: 1.4,
                                        delay: index * 0.08,
                                        ease: "easeInOut"
                                    }}
                                    style={{ display: "inline-block", minWidth: char === " " ? "0.25rem" : "auto" }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </span>
                    </div>
                ) : /* Already guessed word */ showAlreadyGuessed ? (
                    <div className="bg-orange-100 dark:bg-orange-400 h-10 rounded-xl flex items-center justify-center px-4">
                        <motion.span initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }} className="font-black text-orange-800 dark:text-orange-50 text-sm xl:text-lg">
                            Từ &ldquo;{showAlreadyGuessed}&rdquo; đã được đoán trước đó.
                        </motion.span>
                    </div>
                ) : /* Word doesn't exist or too far */ lastGuessResult && lastGuessResult.rank === null ? (
                    <div className="bg-red-100 dark:bg-red-400 h-10 rounded-xl flex items-center justify-center px-4">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="font-black text-red-800 dark:text-red-50 text-sm xl:text-lg"
                        >
                            Từ được đoán không tồn tại hoặc khoảng cách quá xa
                        </motion.span>
                    </div>
                ) : /* Normal display */ guesses.length > 0 ? (
                    <>
                        <motion.div
                            className={`${getBarStyle(guesses[guesses.length - 1].rank).color} h-10 rounded-xl flex items-center px-4`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getBarStyle(guesses[guesses.length - 1].rank).width}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.span
                                className="font-black text-neutral-800 dark:text-neutral-200 text-lg whitespace-nowrap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                {guesses[guesses.length - 1].word}
                            </motion.span>
                        </motion.div>
                        <motion.span
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 font-black text-neutral-800 dark:text-neutral-200 text-lg tabular-nums px-2 py-1 rounded-lg"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        >
                            {guesses[guesses.length - 1].rank}
                        </motion.span>
                    </>
                ) : null}
            </div>
        </motion.div>
    )
}