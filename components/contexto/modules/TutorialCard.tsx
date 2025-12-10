"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TutorialCardProps {
    onFaqDialogOpen: () => void
}

export default function TutorialCard({ onFaqDialogOpen }: TutorialCardProps) {
    return (
        <div className="mb-4 sm:mb-6 max-w-xl mx-auto px-0">
            <Card className="bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4">
                        <div className="text-lg sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-1 sm:mb-2 text-left">🎯 Cách chơi CONTEXTO</div>
                    </div>
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 text-left">
                        <p>Tìm từ bí mật. Bạn có thể đoán không giới hạn.</p>
                        <p>Các từ được sắp xếp bởi thuật toán trí tuệ nhân tạo theo mức độ tương tự với từ bí mật.</p>
                        <p>Sau khi nhập một từ, bạn sẽ thấy vị trí của từ bạn vừa nhập so với từ bí mật. Từ bí mật có vị trí số 1.</p>
                        <p>Thuật toán đã phân tích hàng nghìn văn bản. Nó sử dụng ngữ cảnh mà các từ được sử dụng để tính toán độ tương tự giữa chúng.</p>
                    </div>

                    {/* FAQ Section */}
                </CardContent>
            </Card>
            <div className="mt-4 sm:mt-6 px-0">
                <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="item-1" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
                        <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                            Thứ tự từ được xác định như thế nào?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                            Trò chơi sử dụng thuật toán trí tuệ nhân tạo và hàng nghìn văn bản để tính toán độ tương tự của các từ so với từ trong ngày. Không nhất thiết phải liên quan đến nghĩa của từ, mà là sự gần gũi mà chúng được sử dụng trên internet. Ví dụ, nếu từ trong ngày là &ldquo;bác sĩ&rdquo;, các từ liên quan đến &ldquo;nghề nghiệp&rdquo; hoặc &ldquo;bệnh viện&rdquo; có thể gần với từ trong ngày vì &ldquo;bác sĩ&rdquo; thường được sử dụng trong hai ngữ cảnh đó.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-lg px-3">
                        <AccordionTrigger className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline text-left">
                            Làm thế nào để xin gợi ý?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 pb-3 text-left">
                            Nhấp vào ba chấm ở góc trên bên phải màn hình và chọn tùy chọn &ldquo;Gợi ý&rdquo; và nó sẽ tiết lộ một từ.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="text-center mt-4">
                    <Button
                        onClick={onFaqDialogOpen}
                        variant="ghost"
                        className="border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                    >
                        Xem thêm FAQ
                    </Button>
                </div>
            </div>
            <div className="text-center mt-6 sm:mt-8 px-0">
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2 sm:mb-3">
                    <p className="mb-1 sm:mb-2">Chơi thử game khác</p>
                    <div className="flex justify-center">
                        <Link href="/wordle" className="text-center hover:opacity-75 transition-opacity">
                            <div className="mb-1">
                                <div className="flex gap-0.5 justify-center">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded"></div>
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-800 dark:bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex gap-0.5 justify-center mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-gray-800 dark:bg-gray-300 rounded"></div>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded"></div>
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded"></div>
                                </div>
                                <div className="flex gap-0.5 justify-center mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded"></div>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded"></div>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded"></div>
                                </div>
                            </div>
                            <div className="font-bold text-xs">WORDLE Tiếng Việt</div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Privacy and Terms Links */}
            <div className="text-center mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-600">
                <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <Link
                        href="/privacy"
                        className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                        Chính sách Bảo mật
                    </Link>
                    <span>•</span>
                    <Link
                        href="/terms"
                        className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                        Điều khoản Dịch vụ
                    </Link>
                </div>
            </div>
        </div>
    )
}