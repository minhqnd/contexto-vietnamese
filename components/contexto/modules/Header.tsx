"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, HelpCircle, Lightbulb, Flag, Calendar } from "lucide-react"

interface HeaderProps {
    gameNumber: number
    guessesLength: number
    hints: number
    isInitialLoading: boolean
    gameWon: boolean
    gameGaveUp: boolean
    onShowHowToPlay: () => void
    onHint: () => void
    onGiveUp: () => void
    onGameSelection: () => void
}

export default function Header({
    gameNumber,
    guessesLength,
    hints,
    isInitialLoading,
    gameWon,
    gameGaveUp,
    onShowHowToPlay,
    onHint,
    onGiveUp,
    onGameSelection,
}: HeaderProps) {
    return (
        <div className="text-center mb-3 sm:mb-4">
            <a href="https://instagram.com/minhqnd" target="_blank" className="text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                <span className="dark:text-neutral-200">@minh</span><span className="bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 pr-1 sm:pr-2 py-0.5 sm:py-1">qnd</span>
            </a>
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-8 sm:w-10"></div>
                <div className="text-center flex-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-800 dark:text-neutral-100 mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2">
                        <span>CONTEXTO</span>
                        <svg width="32" height="24" viewBox="0 0 36 36" className="inline-block shrink-0">
                            <path fill="#DA251D" d="M32 5H4a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z"></path>
                            <path fill="#FF0" d="M19.753 16.037L18 10.642l-1.753 5.395h-5.672l4.589 3.333l-1.753 5.395L18 21.431l4.589 3.334l-1.753-5.395l4.589-3.333z"></path>
                        </svg>
                        <span className="text-xs sm:text-sm font-normal text-neutral-600 dark:text-neutral-400">v12.3</span>
                    </h1>
                    <div className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 text-center flex flex-row justify-between gap-1 sm:gap-2">
                        <div className="px-1 sm:px-2 py-0.5 sm:py-1 shrink-0">GAME: <span className="font-bold">{isInitialLoading ? "..." : `#${gameNumber}`}</span></div>
                        <div className="px-1 sm:px-2 py-0.5 sm:py-1 shrink-0">SỐ LẦN ĐOÁN: <span className="font-bold">{isInitialLoading ? "..." : guessesLength}</span></div>
                        {hints > 0 && (
                            <div className="px-1 sm:px-2 py-0.5 sm:py-1 shrink-0">GỢI Ý: <span className="font-bold text-yellow-600">{hints}</span></div>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-neutral-800 shadow-lg border-2 border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group focus:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0">
                            <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-700 dark:text-neutral-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 sm:w-64 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-2xl rounded-2xl p-1 sm:p-2">
                        <DropdownMenuItem onClick={onShowHowToPlay} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-900 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer rounded-xl p-2 mb-1 sm:mb-2">
                            <HelpCircle className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">Cách chơi</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onHint} disabled={isInitialLoading || gameWon || gameGaveUp} className={`transition-all duration-200 cursor-pointer rounded-xl p-2 mb-1 sm:mb-2 ${isInitialLoading || gameWon || gameGaveUp ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-900 dark:hover:text-yellow-400'}`}>
                            <Lightbulb className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                            <div className="flex flex-col">
                                <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">Gợi ý</span>
                                {hints > 0 && (
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Đã dùng: {hints} gợi ý</span>
                                )}
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onGiveUp} disabled={isInitialLoading || gameWon || gameGaveUp} className={`transition-all duration-200 cursor-pointer rounded-xl p-2 mb-1 sm:mb-2 ${isInitialLoading || gameWon || gameGaveUp ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-400'}`}>
                            <Flag className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                            <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">Bỏ cuộc</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onGameSelection} disabled={isInitialLoading} className={`transition-all duration-200 cursor-pointer rounded-xl p-1 sm:p-2 ${isInitialLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-900 dark:hover:text-green-400'}`}>
                            <Calendar className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">Chơi các từ khác</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}