"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"

interface GiveUpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    guessesLength: number
    onConfirmGiveUp: () => void
}

export default function GiveUpDialog({
    open,
    onOpenChange,
    guessesLength,
    onConfirmGiveUp,
}: GiveUpDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm sm:max-w-md bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-2xl rounded-2xl px-4">
                <DialogHeader className="border-b border-neutral-200 dark:border-neutral-600 pb-4 sm:pb-6">
                    <DialogTitle className="text-base sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center">
                        <Flag className="mr-2 sm:mr-3 h-4 sm:h-7 w-4 sm:w-7 text-red-600 dark:text-red-400" />
                        Xác nhận bỏ cuộc
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 sm:py-6">
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 sm:p-4 rounded-xl border border-red-200 dark:border-red-700 mb-3 sm:mb-4">
                            <p className="text-sm sm:text-lg text-red-800 dark:text-red-300 font-semibold mb-2">⚠️ Bạn có chắc chắn muốn bỏ cuộc?</p>
                            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">Từ bí mật sẽ được tiết lộ và game sẽ kết thúc.</p>
                        </div>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">Bạn đã đoán <span className="font-bold">{guessesLength}</span> lần.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="flex-1 border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm sm:text-base"
                        >
                            Tiếp tục chơi
                        </Button>
                        <Button
                            onClick={onConfirmGiveUp}
                            className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-sm sm:text-base"
                        >
                            Bỏ cuộc
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}