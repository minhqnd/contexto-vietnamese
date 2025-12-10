"use client"

import { useRef, useEffect } from "react"

interface InputSectionProps {
    currentGuess: string
    setCurrentGuess: (guess: string) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    isLoading: boolean
    isInitialLoading: boolean
    gameWon: boolean
    gameGaveUp: boolean
}

export default function InputSection({
    currentGuess,
    setCurrentGuess,
    onKeyDown,
    isLoading,
    isInitialLoading,
    gameWon,
    gameGaveUp,
}: InputSectionProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!(gameWon || gameGaveUp) && inputRef.current) {
            inputRef.current.focus()
        }
    }, [gameWon, gameGaveUp])

    return (
        <div className="mb-4 sm:mb-6">
            <div className="relative max-w-xl mx-auto">
                <input
                    ref={inputRef}
                    type="text"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={isInitialLoading ? "Đang tải dữ liệu..." : "Điền một từ"}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    enterKeyHint="send"
                    readOnly={isLoading || isInitialLoading}
                    disabled={gameWon || gameGaveUp}
                    className={`w-full h-12 sm:h-14 text-xl sm:text-2xl font-bold text-left bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg focus:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 placeholder:text-base sm:placeholder:text-lg placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:font-bold text-neutral-900 dark:text-neutral-100 px-4 ${(gameWon || gameGaveUp) ? 'opacity-50 cursor-not-allowed' : ''} ${isInitialLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
    )
}