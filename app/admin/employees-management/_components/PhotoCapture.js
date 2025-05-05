import { useEffect, useState } from "react";
import Image from "next/image";

export default function PhotoCapture({
  capturing,
  photo,
  handleStartCapture,
  handleCapturePhoto,
  videoRef,
  ashima_id,
  onRemovePhoto,
  onPhotoUpload, // Add a prop for handling uploaded photos
}) {
  // State to manage the image source
  const [imageSrc, setImageSrc] = useState(null); // Initialize with `null`

  // Update imageSrc whenever the photo or ashima_id changes
  useEffect(() => {
    if (typeof photo === "string" && photo.startsWith("data:image/")) {
      setImageSrc(photo); // Use Base64 photo if available
    } else if (ashima_id) {
      setImageSrc(`/api/employees/photo?ashima_id=${ashima_id}&t=${new Date().getTime()}`);
    } else {
      setImageSrc(null); // Set to `null` if no valid photo or ashima_id
    }
  }, [photo, ashima_id]);

  // Handle image load error
  const handleImageError = () => {
    console.error("Failed to load image, switching to placeholder.");
    setImageSrc("/placeholder.png"); // Set fallback to placeholder
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        setImageSrc(base64Image); // Update the image source
        if (onPhotoUpload) {
          onPhotoUpload(base64Image); // Pass the Base64 image to the parent component
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="font-medium text-gray-700 mb-2">Employee Photo</h3>
      <div className="bg-gray-100 border rounded-md overflow-hidden">
        {capturing ? (
          // Webcam capture mode
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              className="w-full aspect-square object-cover"
              autoPlay
              playsInline
            />
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="w-full py-2 bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
            >
              Capture Photo
            </button>
          </div>
        ) : (
          // Display photo or placeholder
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt="Employee"
                  className="w-full h-full object-cover"
                  onError={handleImageError} // Handle image load error
                  width={250}
                  height={250}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </div>
            <div className="w-full flex flex-col">
              <button
                type="button"
                onClick={handleStartCapture}
                className="w-full py-2 bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
              >
                {photo ? "Change Photo" : "Take Photo"}
              </button>
              {photo && onRemovePhoto && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="w-full py-2 bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                >
                  Remove Photo
                </button>
              )}
              <label className="w-full py-2 bg-gray-500 text-black text-sm hover:bg-gray-600 transition-colors text-center cursor-pointer mt-2">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}