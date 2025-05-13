"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { FiX, FiLoader } from "react-icons/fi";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmployeeFormDialog({ 
  open, 
  onOpenChange, 
  employee, 
  departments = [], 
  positions = [], 
  onSubmit,
  isLoadingOptions = false
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Debug departments and positions
  useEffect(() => {
    if (open) {
      console.log("Dialog opened with departments:", departments);
      console.log("Dialog opened with positions:", positions);
    }
  }, [open, departments, positions]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset form when employee changes
  useEffect(() => {
    if (open) {
      if (employee) {
        console.log("Setting form values for employee:", employee);
        setValue("ashima_id", employee.ashima_id);
        setValue("name", employee.name);
        setValue("department_id", employee.department_id?.toString());
        setValue("position_id", employee.position_id?.toString());
        setValue("rfid_tag", employee.rfid_tag);
        setValue("emp_stat", employee.emp_stat || "regular");
        setValue("status", employee.status);
        setImagePreview(employee.photo);
      } else {
        reset({
          ashima_id: "",
          name: "",
          department_id: "",
          position_id: "",
          rfid_tag: "",
          emp_stat: "regular",
          status: "active",
        });
        setImagePreview(null);
      }
    }
  }, [employee, open, reset, setValue]);

  // Handle image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (data) => {
    console.log("Form submission data:", data);
    const success = await onSubmit(data, imagePreview);
    if (success) {
      reset();
      setImagePreview(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            Fill in the employee details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Employee Details</TabsTrigger>
              <TabsTrigger value="settings">Status & Photo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashima_id">
                    Employee ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ashima_id"
                    {...register("ashima_id", { required: "ID is required" })}
                  />
                  {errors.ashima_id && (
                    <p className="text-sm text-red-500">{errors.ashima_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="department_id"
                    control={control}
                    rules={{ required: "Department is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isLoadingOptions}
                      >
                        <SelectTrigger>
                          {isLoadingOptions ? (
                            <div className="flex items-center">
                              <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                              <span>Loading...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select department" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {departments && departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No departments available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.department_id && (
                    <p className="text-sm text-red-500">
                      {errors.department_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="position_id"
                    control={control}
                    rules={{ required: "Position is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isLoadingOptions}
                      >
                        <SelectTrigger>
                          {isLoadingOptions ? (
                            <div className="flex items-center">
                              <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                              <span>Loading...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select position" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {positions && positions.length > 0 ? (
                            positions.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id.toString()}>
                                {pos.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No positions available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.position_id && (
                    <p className="text-sm text-red-500">
                      {errors.position_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfid_tag">RFID Tag</Label>
                <Input id="rfid_tag" {...register("rfid_tag")} />
                <p className="text-xs text-muted-foreground">
                  RFID tag is required for active employees. Leave empty for resigned employees.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp_stat">Employment Status</Label>
                  <Controller
                    name="emp_stat"
                    control={control}
                    defaultValue="regular"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || "regular"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="contractual">Contractual</SelectItem>
                          <SelectItem value="probationary">Probationary</SelectItem>
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
                    defaultValue="active"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || "active"}>
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

              <div className="space-y-2">
                <Label htmlFor="photo">Employee Photo</Label>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a clear photo of the employee. Max size: 2MB.
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <div className="h-[100px] w-[100px] relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white"
                        onClick={() => setImagePreview(null)}
                      >
                        <FiX className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingOptions}>
              {isSubmitting ? "Saving..." : "Save Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}