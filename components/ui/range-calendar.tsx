"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RangeCalendarProps {
  className?: string
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  placeholder?: string
  id?: string
  disabled?: boolean
}

const RangeCalendar = React.forwardRef<HTMLButtonElement, RangeCalendarProps>(
  ({ className, dateRange, onDateRangeChange, placeholder = "Pick a date range", id, disabled }, ref) => {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (range: DateRange | undefined) => {
      onDateRangeChange?.(range)
      // Close popover when both dates are selected
      if (range?.from && range?.to) {
        setOpen(false)
      }
    }

    const formatDateRange = () => {
      if (!dateRange?.from) return placeholder
      
      if (dateRange.from && !dateRange.to) {
        return format(dateRange.from, "LLL dd, y")
      }
      
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
      }
      
      return placeholder
    }

    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={id}
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
              disabled={disabled}
              aria-label="Select date range"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-white border border-gray-200" 
            align="start"
            aria-label="Date range picker"
            side="bottom"
            sideOffset={4}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              className="rounded-md border-0 bg-white"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 bg-white",
                caption: "flex justify-center pt-1 relative items-center bg-white",
                caption_label: "text-sm font-medium text-gray-900",
                nav: "flex items-center justify-between w-full absolute top-0 left-0 right-0 px-2",
                nav_button: cn(
                  "h-6 w-6 bg-white border border-gray-200 rounded-md p-0 text-gray-600",
                  "hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300",
                  "focus:bg-gray-50 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  "transition-all duration-150 ease-in-out"
                ),
                nav_button_previous: "absolute left-2 top-1",
                nav_button_next: "absolute right-2 top-1",
                table: "w-full border-collapse space-y-1 bg-white",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] bg-white",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative bg-white [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-50 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 bg-white",
                  "hover:bg-gray-50 hover:text-gray-900",
                  "focus:bg-gray-50 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  "transition-all duration-150 ease-in-out"
                ),
                day_range_end: "day-range-end",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
                day_today: "bg-gray-100 text-gray-900 font-semibold",
                day_outside: "day-outside text-gray-400 opacity-50 aria-selected:bg-gray-50 aria-selected:text-gray-400 aria-selected:opacity-30",
                day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                day_hidden: "invisible",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

RangeCalendar.displayName = "RangeCalendar"

export { RangeCalendar, type RangeCalendarProps }
