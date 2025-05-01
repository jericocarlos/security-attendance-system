"use client";

import { useState, useRef } from "react";
import FormFields from "./FormFields"; // Import shared component
import PhotoCapture from "./PhotoCapture"; // Import shared component
import FormActions from "./FormActions"; // Import shared component

export default function AddEmployeeForm({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    ashima_id: "",
    name: "",
    department: "",
    position: "",
    rfid_tag: "",
    photo: "", // Base64 string for the photo
    emp_stat: "Regular", // Default to "Regular"
    status: "active",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartCapture = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Failed to access webcam:", err);
      setCapturing(false);
    }
  };

  const handleCapturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 300, 300);

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;

    const photo = canvas.toDataURL("image/jpeg", 0.7);
    console.log("Captured photo:", photo.substring(0, 50) + "...");
    setFormData((prev) => ({ ...prev, photo }));
    setCapturing(false);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: ""
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
        const errorText = await response.text();
        setError(`Failed to save employee: ${errorText}`);
        console.error("API Error Response:", errorText);
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
            <FormFields formData={formData} handleChange={handleChange} />
          </div>
          
          {/* Right side - Photo Capture */}
          <div className="w-full md:w-64 md:min-w-[250px]">
            <PhotoCapture
              capturing={capturing}
              photo={formData.photo}
              handleStartCapture={handleStartCapture}
              handleCapturePhoto={handleCapturePhoto}
              videoRef={videoRef}
              onRemovePhoto={handleRemovePhoto}
            />
          </div>
        </form>
        
        {/* Form Actions - at the bottom */}
        <div className="mt-6 pt-4 border-t flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
        
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}