"use client";

import { useState, useRef } from "react";
import FormFields from "./FormFields"; // Import shared FormFields component
import PhotoCapture from "./PhotoCapture"; // Import shared PhotoCapture component
import FormActions from "./FormActions"; // Import shared FormActions component

export default function EditEmployeeForm({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState({
    ashima_id: employee?.ashima_id || "",
    name: employee?.name || "",
    department: employee?.department || "",
    position: employee?.position || "",
    rfid_tag: employee?.rfid_tag || "",
    photo: employee?.photo || "", // Base64 string for the photo
    emp_stat: employee?.emp_stat || "Regular",
    status: employee?.status || "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New state for error messages
  const [capturing, setCapturing] = useState(false); // State for camera capture
  const videoRef = useRef(null); // Ref for the video element
  const canvasRef = useRef(null); // Ref for the canvas element

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
  
    // Convert the captured image to Base64
    const photo = canvas.toDataURL("image/jpeg", 0.7); // Quality at 70%
    console.log("Captured Photo (Base64):", photo); // Debugging log
    setFormData((prev) => ({ ...prev, photo })); // Update the form data with the new photo
  
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
    setError(null); // Clear previous errors

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log("Photo being sent:", formData.photo);
    try {
      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data); // Pass updated employee data to the parent
      } else {
        const errorText = await response.text();
        setError(`Failed to update employee: ${errorText}`);
        console.error("Failed to update employee:", errorText);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Failed to update employee:", err);
    } finally {
      setLoading(false);
      if (!error) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-150">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Employee</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Shared Form Fields */}
          <FormFields formData={formData} handleChange={handleChange} />

          {/* Photo Capture */}
          <PhotoCapture
            capturing={capturing}
            photo={formData.photo} // This should be a string or null
            handleStartCapture={handleStartCapture}
            handleCapturePhoto={handleCapturePhoto}
            videoRef={videoRef}
            ashima_id={formData.ashima_id} // Pass ashima_id to fetch existing photo
          />

          {/* Form Actions */}
          <FormActions
            loading={loading}
            onClose={onClose}
            submitLabel={loading ? "Updating..." : "Update"} // Dynamic button label
          />
        </form>

        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}