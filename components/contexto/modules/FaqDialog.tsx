"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

interface FaqDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FaqDialog({ open, onOpenChange }: FaqDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-2xl rounded-2xl px-4">
        <DialogHeader className="border-b border-neutral-200 dark:border-neutral-600 pb-4 sm:pb-6">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center">
            <HelpCircle className="mr-2 sm:mr-3 h-5 sm:h-7 w-5 sm:w-7 text-blue-600 dark:text-blue-400" />
            Câu hỏi thường gặp
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto p-2">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="faq-3" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                Tôi không thể đoán ra từ. Tôi có thể xem từ trong ngày là gì không?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                Trong trường hợp bạn không muốn tiếp tục đoán từ, bạn có tùy chọn bỏ cuộc. Để làm điều đó, nhấp vào ba chấm ở góc trên bên phải màn hình và chọn tùy chọn &ldquo;Bỏ cuộc&rdquo;. Từ trong ngày sẽ được hiển thị trên màn hình.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                Tôi muốn chơi nhiều hơn một game mỗi ngày, có thể không?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                Có. Có thể chơi các game của những ngày trước kể từ ngày ra mắt Contexto hoặc chơi một game ngẫu nhiên. Để làm điều đó, nhấp vào ba chấm ở góc trên bên phải màn hình và chọn tùy chọn &ldquo;Chơi các từ khác&rdquo;. Bạn có thể chọn game của một ngày cụ thể hoặc chơi ở chế độ ngẫu nhiên.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                Tôi không chơi hôm qua. Tôi vẫn có thể chơi game hôm qua không?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                Có, các game trước có thể được chơi bất cứ lúc nào. Để làm điều đó, nhấp vào ba chấm ở góc trên bên phải màn hình và chọn tùy chọn &ldquo;Chơi các từ khác&rdquo;. Bạn có thể chọn game của một ngày cụ thể hoặc chơi ở chế độ ngẫu nhiên.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-6" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                Tôi muốn chơi bằng ngôn ngữ khác, làm thế nào?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                Vào contexto.me chơi nhé, ở đây có Tiếng Việt thôi hehe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-7" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                Sao mãi chưa cập nhật từ mới?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                Từ mới được cập nhật hàng ngày, nếu không có là do tác giả lười:)), liên hệ tác giả nếu muốn cập nhật luôn nhé.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}