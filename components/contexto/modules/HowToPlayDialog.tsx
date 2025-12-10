"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

interface HowToPlayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HowToPlayDialog({ open, onOpenChange }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-2xl bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-2xl rounded-2xl px-4">
        <DialogHeader className="border-b border-neutral-200 dark:border-neutral-600 pb-4 sm:pb-6">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center">
            <HelpCircle className="mr-2 sm:mr-3 h-5 sm:h-7 w-5 sm:w-7 text-blue-600 dark:text-blue-400" />
            Cách chơi CONTEXTO
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 p-2">
          <div className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <p className="font-semibold text-blue-900 dark:text-blue-300">🎯 Mục tiêu: Tìm từ bí mật. Bạn có thể đoán không giới hạn.</p>
          </div>
          <p className="leading-relaxed">
            Các từ được sắp xếp bởi thuật toán trí tuệ nhân tạo theo mức độ tương tự với từ bí mật.
          </p>
          <p className="leading-relaxed">
            Sau khi nhập một từ, bạn sẽ thấy vị trí của từ bạn vừa nhập so với từ bí mật. <span className="font-bold text-green-600">Từ bí mật có vị trí số 1.</span>
          </p>
          <div className="bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 sm:p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <p className="leading-relaxed text-yellow-900 dark:text-yellow-300">
              <span className="font-semibold">💡 Lưu ý:</span> Thuật toán đã phân tích hàng nghìn văn bản. Nó sử dụng ngữ cảnh mà các từ được sử dụng để tính toán độ tương tự giữa chúng.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}