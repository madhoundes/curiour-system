"use client"

import * as React from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 0,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      today={new Date()} // Explicitly set today's date for consistent highlighting
      navLayout="around" // Position navigation buttons evenly around the caption
      className={cn(
        // Center the whole widget and provide consistent internal spacing
        "p-4 w-full max-w-sm mx-auto",
        className
      )}
      classNames={{
        // layout
        months: "flex flex-col items-center justify-center",
        month: "w-full space-y-3",
        // caption/title centered with proper spacing
        caption: "relative flex items-center justify-center px-8",
        caption_label: "text-base font-medium",
        // navigation arrows positioned evenly at sides of caption with proper flexbox
        nav: "absolute inset-0 flex items-center justify-between w-full",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 z-10"
        ),
        nav_button_previous: "relative",
        nav_button_next: "relative",
        // weekdays header and weeks grid
        weekdays: "grid grid-cols-7 gap-1",
        weekday:
          "text-center text-[0.8rem] font-medium text-muted-foreground",
        week: "grid grid-cols-7 gap-1 mt-1",
        day: "flex items-center justify-center",
        // day button styling with clear selected state and today's date highlighting
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          "data-[selected=true]:bg-black data-[selected=true]:text-white",
          "data-[today=true]:bg-blue-50 data-[today=true]:text-blue-700 data-[today=true]:font-semibold"
        ),
        // states
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
