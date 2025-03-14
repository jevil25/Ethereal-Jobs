"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "./button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { format } from "date-fns";

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const [month, setMonth] = React.useState<Date>(new Date()); // State for selected month

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month} // Set controlled month
      onMonthChange={setMonth} // Handle month changes
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <button
            type="button"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
            }
            className="p-1"
          >
            <ChevronLeft className={cn("size-4", className)} {...props} />
          </button>
        ),
        IconRight: ({ className, ...props }) => (
          <button
            type="button"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
            }
            className="p-1"
          >
            <ChevronRight className={cn("size-4", className)} {...props} />
          </button>
        ),
        Caption() {
          return (
            <div className="flex justify-between items-center w-full">
              <button
                type="button"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
                }
                className="p-1"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center space-x-2 justify-center">
                <span className="text-sm font-medium">
                  {month.toLocaleString("default", { month: "long" })}
                </span>
                <select
                  className="text-sm font-medium bg-transparent border-none outline-none flex items-center"
                  value={month.getFullYear()}
                  onChange={(e) =>
                    setMonth(
                      new Date(parseInt(e.target.value), month.getMonth()),
                    )
                  }
                >
                  {Array.from(
                    { length: 100 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
                }
                className="p-1"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          );
        },
      }}
      toDate={new Date()}
      {...props}
    />
  );
}

function CalendarForm({
  value,
  setValue,
  disabled,
  className,
}: {
  value: Date | undefined;
  setValue: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[240px] pl-3 text-left font-normal ${className}`}
          disabled={disabled}
        >
          {value ? format(value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={setValue} />
      </PopoverContent>
    </Popover>
  );
}

export { Calendar, CalendarForm };
