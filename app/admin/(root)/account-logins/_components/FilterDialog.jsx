"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FilterDialog({
  open,
  onOpenChange,
  filters,
  setFilters,
  availableRoles = [],
}) {
  // Initialize form with current filters - use "all" instead of empty string
  const form = useForm({
    defaultValues: {
      role: filters.role || "all",
    },
  });

  // Handle form submission
  const handleSubmit = (data) => {
    // Convert "all" back to empty string for filtering
    const processedData = {
      ...data,
      role: data.role === "all" ? "" : data.role,
    };
    setFilters(processedData);
    onOpenChange(false);
  };

  // Reset all filters
  const handleReset = () => {
    form.reset({
      role: "all",
    });
    setFilters({ role: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Accounts</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Role Filter */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Changed empty string to "all" */}
                      <SelectItem value="all">All Roles</SelectItem>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={handleReset}>
                Reset Filters
              </Button>
              <Button type="submit">Apply Filters</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}