"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ 
  className, 
  classNames, 
  showOutsideDays = true, 
  selectedDate, 
  onChange,
  ...props 
}) {
  return (
    <div className={cn("p-3 relative", className)}>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        calendarClassName={cn("border rounded-md shadow-md", classNames?.calendar)}
        dayClassName={(date) =>
          cn(
            "text-center text-sm p-1 rounded-md",
            date.toDateString() === new Date().toDateString()
              ? "bg-accent text-accent-foreground"
              : "",
            props.disabledDates?.some((d) => d.getTime() === date.getTime())
              ? "text-muted-foreground opacity-50"
              : ""
          )
        }
        popperClassName={cn("shadow-lg z-10", classNames?.popper)}
        renderCustomHeader={({
          monthDate,
          customHeaderCount,
          decreaseMonth,
          increaseMonth,
        }) => (
          <div className="flex justify-between items-center pb-2">
            <button
              onClick={decreaseMonth}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "p-2 rounded-full"
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium">
              {monthDate.toLocaleString("default", { month: "long" })}{" "}
              {monthDate.getFullYear()}
            </span>
            <button
              onClick={increaseMonth}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "p-2 rounded-full"
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
        showPopperArrow={false}
        disabledKeyboardNavigation
        {...props}
      />
    </div>
  );
}

export { Calendar };