export default function PhotoCapture({
  capturing,
  photo,
  handleStartCapture,
  handleCapturePhoto,
  videoRef,
  ashima_id,
  onRemovePhoto, // New prop for handling photo removal
}) {
  // Ensure photo is a string or fallback to null
  const validPhoto = typeof photo === "string" ? photo : null;

  return (
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
          {/* Dynamically display existing photo or placeholder */}
          <img
            src={
              validPhoto && validPhoto.startsWith("data:image/")
                ? validPhoto // If photo is a valid Base64 string, use it
                : ashima_id
                ? `/api/employees/photo?ashima_id=${ashima_id}` // Fetch existing photo from the server
                : "/placeholder.png" // Default placeholder image
            }
            alt="Captured"
            className="w-full h-70 object-cover mb-2 rounded-md"
          />
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleStartCapture}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mb-2"
            >
              {validPhoto ? "Change Photo" : "Start Camera"}
            </button>
            
            {/* Only show Remove Photo button if there is a photo to remove */}
            {validPhoto && onRemovePhoto && (
              <button
                type="button"
                onClick={onRemovePhoto}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mb-2"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}