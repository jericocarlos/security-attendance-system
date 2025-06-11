"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { FiX } from "react-icons/fi";
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
  const [leaders, setLeaders] = useState([]);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
    watch,
    setError
  } = useForm();

  // Watch the status field to detect changes
  const status = watch("status");

  // Fetch leaders when dialog opens
  useEffect(() => {
    if (open) {
      fetchLeaders();
    }
  }, [open]);

  // Function to fetch leaders from API
  const fetchLeaders = async () => {
    try {
      setIsLoadingLeaders(true);
      const response = await fetch('/api/admin/leaders');
      if (!response.ok) {
        throw new Error('Failed to fetch leaders');
      }
      const data = await response.json();
      setLeaders(data.leaders || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    } finally {
      setIsLoadingLeaders(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (employee) {
        // Edit mode: populate fields with employee data
        setValue("ashima_id", employee.ashima_id);
        setValue("name", employee.name);
        setValue("department_id", employee.department_id?.toString());
        setValue("position_id", employee.position_id?.toString());
        setValue("leader", employee.leader?.toString() || ""); // <-- update here
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
          leader: "", // <-- update here
          rfid_tag: "",
          emp_stat: "regular",
          status: "active",
        });
        setImagePreview(null);
      }
    }
  }, [employee, open, reset, setValue]);

  // Add an effect to clear RFID tag and photo when status is changed to resigned
  useEffect(() => {
    if (employee && status === "resigned") {
      setValue("rfid_tag", "");
      setImagePreview(null);
      setActiveTab("settings");
    }
  }, [status, employee, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data) => {
    // Convert the "none" string to null for the leader field
    if (data.leader === "none") {
      data.leader = null;
    }
    // Log the form data to verify leader is present
    console.log("Form data being submitted:", data);
    console.log("Leader value:", data.leader);

    try {
      if (data.status !== "resigned" && !data.rfid_tag.trim()) {
        setError("rfid_tag", { 
          type: "manual", 
          message: "RFID Tag is required for active employees" 
        });
        setActiveTab("settings");
        return false;
      }
      if (data.status === "resigned") {
        data.rfid_tag = null;
        data.removePhoto = true;
      }
      const success = await onSubmit(data, data.status === "resigned" ? null : imagePreview);
      if (success) {
        reset();
        setImagePreview(null);
      }
      return success;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
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
          {status === "resigned" && employee && (
            <p className="mt-2 text-amber-600 text-sm">
              Note: When an employee is marked as resigned, their RFID tag and photo will be automatically removed.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Employee Details</TabsTrigger>
              <TabsTrigger value="settings">Rfid & Photo</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4">
              {/* Employee ID and Name Fields */}
              <div className="grid grid-cols-2 gap-4">
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
                        <SelectTrigger className="max-w-full overflow-hidden">
                          <SelectValue placeholder="Select position" className="truncate w-full block" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[300px]">
                          {positions.map((pos) => (
                            <SelectItem 
                              key={pos.id} 
                              value={pos.id.toString()}
                              className="truncate" 
                              title={pos.name}
                            >
                              {pos.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Leader Field using the fetched leaders */}
              <div className="space-y-2">
                <Label htmlFor="leader">Reporting to</Label>
                <Controller
                  name="leader"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                      disabled={isLoadingLeaders || isLoadingOptions}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingLeaders ? "Loading leaders..." : "Select leader (optional)"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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
                <Label htmlFor="photo">
                  Employee Photo
                  {status === "resigned" && (
                    <span className="ml-2 text-amber-600">(Removed for resigned employees)</span>
                  )}
                </Label>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                      disabled={status === "resigned"}
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
                <Label htmlFor="rfid_tag">
                  RFID Tag {status !== "resigned" && <span className="text-red-500">*</span>}
                  {status === "resigned" && (
                    <span className="ml-2 text-amber-600">(Removed for resigned employees)</span>
                  )}
                </Label>
                <Input 
                  id="rfid_tag" 
                  {...register("rfid_tag", { 
                    required: status !== "resigned" ? "RFID Tag is required for active employees" : false 
                  })} 
                  disabled={status === "resigned"}
                />
                {errors.rfid_tag && (
                  <p className="text-sm text-red-500">{errors.rfid_tag.message}</p>
                )}
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
            <Button type="submit" disabled={isSubmitting || isLoadingOptions || isLoadingLeaders}>
              {isSubmitting ? "Saving..." : "Save Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}