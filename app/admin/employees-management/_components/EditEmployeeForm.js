"use client";

import { useState, useRef, useEffect } from "react";
import FormFields from "./FormFields";
import PhotoCapture from "./PhotoCapture";

export default function EditEmployeeForm({ employee, onSave, onClose }) {
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
  const [error, setError] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Log photo type on initial render
  useEffect(() => {
    console.log("Initial photo type:", typeof formData.photo);
  }, [formData.photo]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (prev[name] === value) return prev; // Prevent unnecessary updates
      return { ...prev, [name]: value };
    });
  };

  // Start webcam capture
  const handleStartCapture = async () => {
    setCapturing(true);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error('Media Devices API not supported in this environment');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Failed to access webcam:", err);
      setCapturing(false);
    }
  };

  // Capture photo from webcam
  const handleCapturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = 250;
    canvas.height = 250;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 250, 250);

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;

    const photo = canvas.toDataURL("image/jpeg", 0.7);
    console.log("Captured new photo:", photo.substring(0, 50) + "...");
    console.log("Photo size:", Math.round(photo.length / 1024), "KB");

    setFormData((prev) => ({ ...prev, photo }));
    setCapturing(false);
  };

  // Validate form fields
  const validateForm = () => {
    if (!formData.ashima_id || !formData.name || !formData.rfid_tag) {
      setError("Ashima ID, Name, and RFID Tag are required.");
      return false;
    }
    return true;
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const submissionData = {
      ...formData,
      photo: formData.photo || null, // Use null if photo is empty
    };

    console.log("Submitting employee update:", submissionData);

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();
      if (response.ok) {
        onSave(responseData);
        onClose();
      } else {
        setError(`Failed to update employee: ${responseData.message || "Unknown error"}`);
        console.error("API Error Response:", responseData);
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err.message}`);
      console.error("Failed to update employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: "" }));
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
            <FormFields
              formData={formData}
              handleChange={handleChange}
              disabled={true} // Disable Ashima ID field
            />
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

        {/* Form Actions */}
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
            type="submit"
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