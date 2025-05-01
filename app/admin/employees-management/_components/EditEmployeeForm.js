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
  
    canvas.width = 300;
    canvas.height = 300;
  
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 300, 300);
  
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
  
    // Convert the captured image to Base64 with proper formatting
    const photo = canvas.toDataURL("image/jpeg", 0.7); 
    console.log("Captured new photo:", photo.substring(0, 50) + "..."); // Log the start of the string
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
    setError(null); // Clear previous errors

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission, ensuring photo is either a string or null
    const submissionData = {
      ...formData,
      photo: typeof formData.photo === "string" ? formData.photo : null
    };

    console.log("Submitting photo type:", typeof submissionData.photo);

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data); // Pass updated employee data to the parent
        onClose();
      } else {
        const errorResponse = await response.text();
        setError(`Failed to update employee: ${errorResponse}`);
        console.error("API Error Response:", errorResponse);
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

          {/* Photo Capture with option to remove */}
          <div className="col-span-1 flex flex-col">
            <PhotoCapture
              capturing={capturing}
              photo={formData.photo}
              handleStartCapture={handleStartCapture}
              handleCapturePhoto={handleCapturePhoto}
              videoRef={videoRef}
              ashima_id={formData.ashima_id}
              onRemovePhoto={handleRemovePhoto} // Keep this one
            />
            
            {/* Remove this duplicate button */}
            {/* {formData.photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="mt-2 text-red-500 text-sm"
              >
                Remove Photo
              </button>
            )} */}
          </div>

          {/* Form Actions */}
          <FormActions
            loading={loading}
            onClose={onClose}
            submitLabel={loading ? "Updating..." : "Update"}
          />
        </form>

        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}