"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Shuffle } from "lucide-react"
import type { GameInfo } from "./types"

interface GameSelectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    gamesList: GameInfo[]
    currentGameNumber: number
    isInitialLoading: boolean
    onGameSelection: (gameId: number) => void
    onRandomGame: () => void
}

export default function GameSelectionDialog({
    open,
    onOpenChange,
    gamesList,
    currentGameNumber,
    isInitialLoading,
    onGameSelection,
    onRandomGame,
}: GameSelectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-[95vw] sm:max-w-lg bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-2xl rounded-2xl p-4 sm:p-6">
                <DialogHeader className="border-b border-neutral-200 dark:border-neutral-600 pb-3 sm:pb-4">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center">
                        <Calendar className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                        Các từ khác
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto p-1 sm:p-2">
                    <Button
                        onClick={onRandomGame}
                        disabled={isInitialLoading}
                        className={`w-full font-semibold py-4 sm:py-6 rounded-xl transition-all duration-200 shadow-md mb-2 group ${isInitialLoading ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white'}`}
                    >
                        <Shuffle className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-180 transition-transform duration-500" />
                        <div className="flex flex-col items-start">
                            <span className="text-sm sm:text-base">Từ ngẫu nhiên</span>
                        </div>
                    </Button>

                    {gamesList.length === 0 ? (
                        <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                            {isInitialLoading ? "Đang tải dữ liệu..." : "Đang tải danh sách games..."}
                        </div>
                    ) : (
                        gamesList.map((game) => {
                            const isCurrentGame = game.id === currentGameNumber
                            return (
                                <div
                                    key={game.id}
                                    onClick={() => !isInitialLoading && onGameSelection(game.id)}
                                    className={`flex items-center justify-between p-2 sm:p-3 rounded-xl transition-all duration-200 border shadow-sm hover:shadow-md ${isCurrentGame
                                        ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                        : "bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500"
                                        } ${isInitialLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className={`font-bold text-base sm:text-lg text-center items-center ${isCurrentGame ? "text-blue-800 dark:text-blue-300" : "text-neutral-800 dark:text-neutral-200"
                                        }`}>
                                        #{game.id} - <span className={`text-sm sm:text-base font-normal ${isCurrentGame ? "text-blue-600 dark:text-blue-400" : "text-neutral-600 dark:text-neutral-400"
                                            }`}>{game.createdDate}</span>
                                    </div>
                                    {game.status !== "chưa chơi" && (
                                        <div className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full border ${game.status === "đã hoàn thành"
                                            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                                            : game.status === "đang chơi"
                                                ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300"
                                                : game.status === "bỏ cuộc"
                                                    ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
                                                    : "bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                                            }`}>
                                            {game.status}
                                        </div>
                                    )}
                                </div>
                            )
                        }))}
                </div>
            </DialogContent>
        </Dialog>
    )
}