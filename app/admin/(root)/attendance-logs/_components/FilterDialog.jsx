"use client";

import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function toUTCDate(date) {
  if (!date) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export default function FilterDialog({ 
  open, 
  onOpenChange, 
  filters, 
  setFilters,
  departments = [] // Add departments prop
}) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      logType: filters?.logType ?? "ALL",
      department: filters?.department ?? "all", // Add department default
      dateRange: filters?.dateRange ?? { from: null, to: null },
    },
  });

  const handleApplyFilters = (data) => {
    setFilters({
      ...data,
      department: data.department === "all" ? "" : data.department, // Convert "all" to empty string for API
      dateRange: {
        from: toUTCDate(data.dateRange.from),
        to: toUTCDate(data.dateRange.to),
      },
    });
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    reset({ 
      logType: "ALL", 
      department: "all", // Reset department too
      dateRange: { from: null, to: null } 
    });
    setFilters({ 
      logType: "ALL", 
      department: "", 
      dateRange: { from: null, to: null } 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Filter Attendance Logs</DialogTitle>
          <DialogDescription>
            Select criteria to filter attendance logs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleApplyFilters)}>
          <div className="space-y-4">
            {/* Log Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="logType">Log Status</Label>
              <Controller
                name="logType"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "ALL"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select log status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Logs</SelectItem>
                      <SelectItem value="IN">Time In Only</SelectItem>
                      <SelectItem value="OUT">Complete (In & Out)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "all"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Controller
                name="dateRange"
                control={control}
                render={({ field }) => (
                  <div className="flex space-x-2">
                    <DatePicker
                      selected={field.value?.from ?? null}
                      onChange={(date) =>
                        field.onChange({ ...field.value, from: date })
                      }
                      selectsStart
                      startDate={field.value?.from ?? null}
                      endDate={field.value?.to ?? null}
                      placeholderText="Start Date"
                      className="border rounded-md p-2 w-full"
                    />
                    <DatePicker
                      selected={field.value?.to ?? null}
                      onChange={(date) =>
                        field.onChange({ ...field.value, to: date })
                      }
                      selectsEnd
                      startDate={field.value?.from ?? null}
                      endDate={field.value?.to ?? null}
                      minDate={field.value?.from ?? null}
                      placeholderText="End Date"
                      className="border rounded-md p-2 w-full"
                    />
                  </div>
                )}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button type="submit">Apply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}