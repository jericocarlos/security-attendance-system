"use client";

import { useState, useRef } from "react";

export default function EmployeeForm({ employee, onSave, onClose }) {
  const isEditing = !!employee; // Check if the form is in edit mode (employee prop exists)
  const [formData, setFormData] = useState({
    ashima_id: employee?.ashima_id || "",
    name: employee?.name || "",
    department: employee?.department || "",
    position: employee?.position || "",
    rfid_tag: employee?.rfid_tag || "",
    photo: employee?.photo || "", // Base64 string for the photo
    emp_stat: employee?.emp_stat || "Regular", // Default to "Regular"
    status: employee?.status || "active",
  });
  const [loading, setLoading] = useState(false);
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
  
    // Set the desired width and height for the compressed image
    const desiredWidth = 300; // Adjust as needed
    const desiredHeight = 300; // Adjust as needed
  
    // Resize the canvas to the desired dimensions
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
  
    const ctx = canvas.getContext("2d");
  
    // Draw the video frame onto the resized canvas
    ctx.drawImage(video, 0, 0, desiredWidth, desiredHeight);
  
    // Stop the camera stream
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
  
    // Get the compressed Base64 image string
    const photo = canvas.toDataURL("image/jpeg", 0.7); // Use JPEG format for compression, and set quality to 0.7 (70%)
  
    setFormData((prev) => ({
      ...prev,
      photo, // Store the compressed Base64 string
    }));
  
    setCapturing(false);
  };
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Send the form data, including the Base64 image string, to the backend
      const response = await fetch(isEditing ? `/api/admin/employees/${employee.id}` : `/api/admin/employees`, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // The `photo` field contains the Base64 string
      });
  
      if (response.ok) {
        const data = await response.json();
        onSave(data); // Pass the new/updated employee data to the parent
      } else {
        console.error("Failed to save employee:", await response.text());
      }
    } catch (err) {
      console.error("Failed to save employee:", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-150">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {isEditing ? "Edit Employee" : "Add Employee"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Ashima ID */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Ashima ID</label>
            <input
              type="text"
              name="ashima_id"
              value={formData.ashima_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Name */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Department */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Position */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* RFID Tag */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">RFID Tag</label>
            <input
              type="text"
              name="rfid_tag"
              value={formData.rfid_tag}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Employee Status */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Employee Status</label>
            <select
              name="emp_stat"
              value={formData.emp_stat}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="Regular">Regular</option>
              <option value="Probationary">Probationary</option>
              <option value="Consultant">Consultant</option>
            </select>
          </div>

          {/* Status */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Photo Capture */}
          <div className="col-span-2 justify-center items-center flex flex-col">
            {capturing ? (
              <div className="flex flex-col items-center">
                <video ref={videoRef} className="w-full h-70 bg-gray-200 mb-2" />
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-2"
                >
                  Capture Photo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {formData.photo ? (
                  <img
                  src={
                    isEditing && formData.ashima_id
                      ? `/api/employees/photo?ashima_id=${formData.ashima_id}` // Fetch photo using ashima_id in edit mode
                      : formData.photo // Use captured photo in add mode
                        ? formData.photo
                        : '/placeholder.png' // Default placeholder image
                  }
                  alt="Captured"
                  className="w-full h-70 object-cover mb-2 rounded-md"
                />
                ) : (
                  <div className="w-90 h-70 bg-gray-200 flex items-center justify-center rounded-md mb-2">
                    <span className="text-gray-500">No Photo Captured</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleStartCapture}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mb-2"
                >
                  Start Camera
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}