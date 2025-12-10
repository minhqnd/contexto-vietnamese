"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from "date-fns"

interface CustomDatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  placeholder?: string
}

export function CustomDatePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Select date",
}: CustomDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date())
  const [open, setOpen] = useState(false)

  // Update current month when value changes externally
  useEffect(() => {
    if (value) {
      setCurrentMonth(value)
    }
  }, [value])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Get day names for header
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Calculate days from previous month to fill the first row
  const firstDayOfMonth = startOfMonth(currentMonth).getDay()
  const prevMonthDays =
    firstDayOfMonth > 0
      ? eachDayOfInterval({
        start: addDays(startOfMonth(currentMonth), -firstDayOfMonth),
        end: addDays(startOfMonth(currentMonth), -1),
      })
      : []

  // Calculate days from next month to fill the last row
  const lastDayOfMonth = endOfMonth(currentMonth).getDay()
  const nextMonthDays =
    lastDayOfMonth < 6
      ? eachDayOfInterval({
        start: addDays(endOfMonth(currentMonth), 1),
        end: addDays(endOfMonth(currentMonth), 6 - lastDayOfMonth),
      })
      : []

  // Combine all days
  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]

  // Create weeks array (maximum 6 rows of 7 days)
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length && weeks.length < 6; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const handleSelectDate = (date: Date) => {
    onChange(date)
    setOpen(false)
  }

  const isDateDisabled = (date: Date): boolean => {
    return disabled ? disabled(date) : false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium text-sm">{format(currentMonth, "MMMM yyyy")}</div>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = value ? isSameDay(day, value) : false
                const isDisabled = isDateDisabled(day)
                const isTodayDate = isToday(day)

                return (
                  <Button
                    key={`${weekIndex}-${dayIndex}`}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 p-0 font-normal",
                      !isCurrentMonth && "text-muted-foreground opacity-50",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      isTodayDate && !isSelected && "border border-primary/50",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(day)}
                  >
                    {format(day, "d")}
                  </Button>
                )
              }),
            )}
          </div>
          {value && (
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(undefined)
                  setOpen(false)
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

