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

export default function FilterDialog({ 
  open, 
  onOpenChange, 
  departments, 
  positions, 
  leaders, // Changed from supervisors to leaders 
  filters, 
  setFilters 
}) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      department: filters.department || "",
      position: filters.position || "",
      leader: filters.leader || "", // <-- use leader instead of supervisor_id
      status: filters.status || "",
    },
  });

const handleApplyFilters = (data) => {
  // Convert "all" to "" for the API filtering
  const apiFilters = {
    ...data,
    leader: data.leader === "all" ? "" : data.leader
  };
  setFilters(apiFilters);
  onOpenChange(false);
};

  const handleClearFilters = () => {
    reset({ department: "", position: "", leader: "", status: "" }); // <-- use leader
    setFilters({ department: "", position: "", leader: "", status: "" }); // <-- use leader
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Filter Employees</DialogTitle>
          <DialogDescription>
            Select criteria to filter employees.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleApplyFilters)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id.toString()}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Leader Filter */}
            <div className="space-y-2">
              <Label htmlFor="leader">Leader</Label>
              <Controller
                name="leader"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {leaders.map((leader) => (
                          <SelectItem key={leader.id} value={leader.id.toString()}>
                            {leader.name}{leader.position_name ? ` (${leader.position_name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
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