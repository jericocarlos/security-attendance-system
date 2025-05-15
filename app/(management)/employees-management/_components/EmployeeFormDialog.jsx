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

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (open) {
      if (employee) {
        // Edit mode: populate fields with employee data
        setValue("ashima_id", employee.ashima_id);
        setValue("name", employee.name);
        setValue("department_id", employee.department_id?.toString());
        setValue("position_id", employee.position_id?.toString());
        setValue("rfid_tag", employee.rfid_tag);
        setValue("emp_stat", employee.emp_stat || "regular");
        setValue("status", employee.status);
        setImagePreview(employee.photo);
      } else {
        // Add mode: reset fields with default values
        reset({
          ashima_id: "",
          name: "",
          department_id: "",
          position_id: "",
          rfid_tag: "",
          emp_stat: "regular",
          status: "active", // Default status for Add mode
        });
        setImagePreview(null);
      }
    }
  }, [employee, open, reset, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data) => {
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
              <TabsTrigger value="settings">Rfid & Photo</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Employee ID Field */}
                <div className="space-y-2">
                  <Label htmlFor="ashima_id">
                    Employee ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ashima_id"
                    {...register("ashima_id", { required: "ID is required" })}
                    disabled={!!employee} // Disable the field if editing
                  />
                  {errors.ashima_id && (
                    <p className="text-sm text-red-500">{errors.ashima_id.message}</p>
                  )}
                </div>

                {/* Employee Name Field */}
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

              {/* Department and Position Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Controller
                    name="department_id"
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
                    name="position_id"
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
              </div>
                                  <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp_stat">Employment Status</Label>
                  <Controller
                    name="emp_stat"
                    control={control}
                    defaultValue="regular"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "regular"}
                      >
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "active"}
                        disabled={!employee} // Disable the field in Add mode
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


            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">

              {/* Photo Upload */}
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

              {/* RFID Tag Field */}
              <div className="space-y-2">
                <Label htmlFor="rfid_tag">RFID Tag</Label>
                <Input id="rfid_tag" {...register("rfid_tag")} />
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