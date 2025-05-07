"use client";

import { useState } from "react";
import FormFields from "./FormFields";
import PhotoCapture from "./PhotoCapture";
import usePhotoCapture from "@/hooks/usePhotoCapture";
import FormActions from "@/components/FormActions";


export default function AddEmployeeForm({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    ashima_id: "",
    name: "",
    department: "",
    position: "",
    rfid_tag: "",
    photo: "",
    emp_stat: "Regular",
    status: "active",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    capturing,
    videoRef,
    canvasRef,
    handleStartCapture,
    handleCapturePhoto,
    handleRemovePhoto
  } = usePhotoCapture(setFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.ashima_id || !formData.name || !formData.rfid_tag) {
      setError("Ashima ID, Name, and RFID Tag are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data);
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        setError(`Failed to save employee: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err.message}`);
      console.error("Failed to save employee:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-[800px] max-w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Add Employee</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
          {/* Left side - Form Fields */}
          <div className="flex-1">
            <FormFields formData={formData} handleChange={handleChange} disabled={false} />
          </div>
          
          {/* Right side - Photo Capture */}
          <div className="w-full md:w-64 md:min-w-[250px]">
            <PhotoCapture
              capturing={capturing}
              photo={formData.photo}
              handleStartCapture={handleStartCapture}
              handleCapturePhoto={handleCapturePhoto}
              videoRef={videoRef}
              onRemovePhoto={() => handleRemovePhoto(setFormData)}
              onPhotoUpload={(uploadedPhoto) => setFormData((prev) => ({ ...prev, photo: uploadedPhoto }))}
            />
          </div>
        </form>
        
        {/* Form Actions - using the shared component */}
        <div className="mt-6 pt-4 border-t">
          <FormActions
            loading={loading} 
            onClose={onClose}
            submitLabel="Save"
            onSubmit={handleSubmit}
          />
        </div>
        
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}