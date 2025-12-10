"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { formatCompletionTime, getBarStyle } from "./utils"
import type { Guess } from "./types"

interface WinScreenProps {
  gameWon: boolean
  gameGaveUp: boolean
  secretWord: string
  guesses: Guess[]
  gameCompletionTime: number | null
  hints: number
  onGameSelection: () => void
  onClosestWordsOpen: () => void
  closestWords: Array<{ word: string; rank: number }>
  isLoadingClosest: boolean
}

export default function WinScreen({
  gameWon,
  gameGaveUp,
  secretWord,
  guesses,
  gameCompletionTime,
  hints,
  onGameSelection,
  onClosestWordsOpen,
  closestWords,
  isLoadingClosest,
}: WinScreenProps) {
  if (!gameWon && !gameGaveUp) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="won"
        className="mb-4 sm:mb-6 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 2.0, type: "spring" }}
      >
        <Card className={`${gameGaveUp
          ? 'bg-red-100 dark:bg-rose-900/30 border border-red-200 dark:border-rose-800'
          : 'bg-green-100 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-800'
          } shadow-xl rounded-lg`}>
          <CardContent className="text-center py-6 sm:py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            >
              {gameGaveUp ? (
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">😔</div>
              ) : (
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
              )}
            </motion.div>
            <motion.h2
              className={`text-xl sm:text-2xl font-bold mb-2 ${gameGaveUp ? 'text-red-800 dark:text-rose-200' : 'text-green-800 dark:text-emerald-200'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {gameGaveUp ? "Đã bỏ cuộc!" : "Chúc mừng! Bạn đã thắng!"}
            </motion.h2>
            <motion.div
              className={`text-sm sm:text-base mb-3 sm:mb-4 ${gameGaveUp ? 'text-red-700 dark:text-rose-300' : 'text-green-700 dark:text-emerald-300'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              {gameGaveUp ? (
                <>
                  <p className="mb-2">
                    Từ cần tìm: <span className="font-bold text-lg sm:text-xl">&ldquo;{secretWord}&rdquo;</span>
                  </p>
                  <p>Bạn đã đoán {guesses.length - 1} lần trước khi bỏ cuộc.</p>
                  {gameCompletionTime && (
                    <p className="mt-2">
                      ⏱️ Thời gian: <span className="font-semibold">{formatCompletionTime(gameCompletionTime)}</span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="mb-2">
                    Từ cần tìm: <span className="font-bold text-lg sm:text-xl">&ldquo;{secretWord || guesses.find(g => g.rank === 1)?.word}&rdquo;</span>
                  </p>
                  <p>Bạn đã hoàn thành trong {guesses.length} lần đoán.</p>
                  {gameCompletionTime && (
                    <p className="mt-2">
                      ⏱️ Thời gian hoàn thành: <span className="font-semibold">{formatCompletionTime(gameCompletionTime)}</span>
                    </p>
                  )}
                </>
              )}
            </motion.div>

            {gameCompletionTime && (
              <motion.div
                className={`${gameGaveUp
                  ? 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700'
                  : 'bg-green-50 dark:bg-emerald-900/50 border border-green-200 dark:border-emerald-700'
                  } rounded-lg p-3 sm:p-4 mb-3 sm:mb-4`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <div className={`text-sm font-semibold mb-2 sm:mb-3 ${gameGaveUp ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-emerald-200'}`}>📊 Thống kê game</div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 sm:p-3 shadow-sm border border-neutral-200 dark:border-neutral-600">
                    <div className="font-bold text-base sm:text-lg text-blue-600 dark:text-blue-400">{guesses.length}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Lần đoán</div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 sm:p-3 shadow-sm border border-neutral-200 dark:border-neutral-600">
                    <div className="font-bold text-base sm:text-lg text-yellow-600 dark:text-yellow-400">{hints}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Gợi ý</div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 sm:p-3 shadow-sm border border-neutral-200 dark:border-neutral-600">
                    <div className="font-bold text-base sm:text-lg text-purple-600 dark:text-purple-400">{formatCompletionTime(gameCompletionTime)}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Thời gian</div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              <Button
                onClick={onGameSelection}
                className={`w-full ${gameGaveUp
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                  : 'bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                  } text-white font-semibold py-3 rounded-lg transition-all duration-200`}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Chơi các từ khác
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={onClosestWordsOpen}
                    variant="outline"
                    className={`w-full ${gameGaveUp
                      ? 'border-red-300 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-green-300 hover:bg-green-50 dark:border-emerald-600 dark:hover:bg-emerald-900/20 text-green-700 dark:text-emerald-300'
                      } font-semibold py-3 rounded-lg transition-all duration-200`}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Xem 200 từ gần nhất
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-2xl rounded-2xl">
                  <DialogHeader className="border-b border-neutral-200 dark:border-neutral-600 pb-6">
                    <DialogTitle className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center">
                      <Eye className="mr-3 h-7 w-7 text-purple-600 dark:text-purple-400" />
                      200 từ gần nhất với từ &ldquo;{secretWord}&rdquo;
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-4 p-2">
                    {isLoadingClosest ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-neutral-600 dark:text-neutral-400">Đang tải danh sách từ...</div>
                      </div>
                    ) : closestWords.length > 0 ? (
                      closestWords.map((item, index) => {
                        const { color, width } = getBarStyle(item.rank)
                        return (
                          <div key={index} className="relative bg-white dark:bg-neutral-700 rounded-2xl overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-600">
                            <div
                              className={`${color} h-10 rounded-xl flex items-center px-4`}
                              style={{ width: `${width}%` }}
                            >
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-base whitespace-nowrap">{item.word}</span>
                            </div>
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 font-semibold text-neutral-800 dark:text-neutral-200 text-base tabular-nums px-2 py-1 rounded-lg">
                              {item.rank}
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-neutral-600 dark:text-neutral-400">Không thể tải danh sách từ</div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.3 }}
            >
              <Card className={`mt-4 ${gameGaveUp
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                : 'bg-green-50 dark:bg-emerald-900/20 border-green-200 dark:border-emerald-700'
                } border`}>
                <CardContent className="p-4">
                  <div className={`mb-3 font-medium ${gameGaveUp ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-emerald-300'}`}>Chơi thử game khác:</div>
                  <div className="flex justify-center">
                    <Link href="/wordle" className="text-center hover:opacity-75 transition-opacity">
                      <div className="mb-2">
                        <div className="flex gap-1 justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                          <div className="w-2 h-2 bg-gray-800 dark:bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex gap-1 justify-center mt-1">
                          <div className="w-2 h-2 bg-gray-800 dark:bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                        </div>
                        <div className="flex gap-1 justify-center mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-green-700 dark:text-emerald-300">WORDLE Tiếng Việt</div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}