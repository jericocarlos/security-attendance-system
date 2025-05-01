"use client";

import { useState, useRef, useEffect } from "react";
import FormFields from "./FormFields"; // Import shared FormFields component
import PhotoCapture from "./PhotoCapture"; // Import shared PhotoCapture component
import FormActions from "./FormActions"; // Import shared FormActions component

export default function EditEmployeeForm({ employee, onSave, onClose }) {
  // Initialize form data with safer photo handling
  const [formData, setFormData] = useState({
    ashima_id: employee?.ashima_id || "",
    name: employee?.name || "",
    department: employee?.department || "",
    position: employee?.position || "",
    rfid_tag: employee?.rfid_tag || "",
    photo: typeof employee?.photo === "string" ? employee.photo : "", // Ensure photo is a string
    emp_stat: employee?.emp_stat || "Regular",
    status: employee?.status || "active",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New state for error messages
  const [capturing, setCapturing] = useState(false); // State for camera capture
  const videoRef = useRef(null); // Ref for the video element
  const canvasRef = useRef(null); // Ref for the canvas element

  // Debug logging for initial photo data
  useEffect(() => {
    console.log("Initial photo type:", typeof formData.photo);
  }, []);

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
  
    // Reduce the image size to 250x250
    canvas.width = 250;
    canvas.height = 250;
  
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 250, 250);
  
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
  
    // Reduce quality to 0.6 to make the image smaller
    const photo = canvas.toDataURL("image/jpeg", 0.6); 
    console.log("Captured new photo:", photo.substring(0, 50) + "...");
    console.log("Photo size:", Math.round(photo.length / 1024), "KB");
    
    setFormData((prev) => ({ ...prev, photo }));
    setCapturing(false);
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

    // Prepare data for submission with better photo handling
    const submissionData = {
      ...formData,
      photo: formData.photo || null // Use null if photo is empty string or falsy
    };

    console.log("Submitting employee update:");
    console.log("- ID:", employee.id);
    console.log("- Photo included:", submissionData.photo ? "Yes" : "No");
    if (submissionData.photo) {
      console.log("- Photo data type:", typeof submissionData.photo);
      console.log("- Photo length:", submissionData.photo.length);
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.text();
      console.log("Server response:", responseData);
      
      let data;
      try {
        data = JSON.parse(responseData);
      } catch (err) {
        console.error("Failed to parse response as JSON:", responseData);
        throw new Error("Invalid server response");
      }

      if (response.ok) {
        onSave(data); // Pass updated employee data to the parent
        onClose();
      } else {
        setError(`Failed to update employee: ${data.message || responseData}`);
        console.error("API Error Response:", data);
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err.message}`);
      console.error("Failed to update employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Option to remove photo
  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: "" // Set photo to empty string to clear it
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-[800px] max-w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Edit Employee</h2>

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
              ashima_id={formData.ashima_id}
              onRemovePhoto={handleRemovePhoto}
            />
          </div>
        </form>
        
        {/* Form Actions - now at the bottom */}
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
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
        
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}