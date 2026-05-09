"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"

export function DatePickerWithRange({
  className,
  date,
  setDate
}: React.HTMLAttributes<HTMLDivElement> & { 
  date: DateRange | undefined, 
  setDate: (d: DateRange | undefined) => void 
}) {
  const [numberOfMonths, setNumberOfMonths] = React.useState(1)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)")
    const updateNumberOfMonths = () =>
      setNumberOfMonths(mediaQuery.matches ? 2 : 1)

    updateNumberOfMonths()
    mediaQuery.addEventListener("change", updateNumberOfMonths)

    return () => mediaQuery.removeEventListener("change", updateNumberOfMonths)
  }, [])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-auto min-h-10 w-full min-w-0 max-w-full justify-start whitespace-normal text-left font-normal sm:w-[33rem]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-keep leading-5">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy년 MM월 dd일", { locale: ko })} -{" "}
                    {format(date.to, "yyyy년 MM월 dd일", { locale: ko })}
                  </>
                ) : (
                  format(date.from, "yyyy년 MM월 dd일", { locale: ko })
                )
              ) : (
                "날짜 선택"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="max-h-[min(32rem,var(--radix-popover-content-available-height))] w-auto overflow-y-auto p-0"
          align="end"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={numberOfMonths}
            locale={ko}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
