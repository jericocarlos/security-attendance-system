import { useMemo } from "react";

export default function PhotoCapture({
  capturing,
  photo,
  handleStartCapture,
  handleCapturePhoto,
  videoRef,
  ashima_id,
  onRemovePhoto,
}) {
  // Ensure photo is a string or fallback to null
  const validPhoto = typeof photo === "string" ? photo : null;

  // Inside the component
  const imageUrl = useMemo(() => {
    if (validPhoto && validPhoto.startsWith("data:image/")) {
      return validPhoto;
    } else if (ashima_id) {
      // Add a timestamp to prevent caching
      return `/api/employees/photo?ashima_id=${ashima_id}&t=${new Date().getTime()}`;
    } else {
      return "/placeholder.png";
    }
  }, [validPhoto, ashima_id]);

  return (
    <div className="flex flex-col">
      <h3 className="font-medium text-gray-700 mb-2">Employee Photo</h3>
      
      <div className="bg-gray-100 border rounded-md overflow-hidden">
        {capturing ? (
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
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square">
              <img
                src={imageUrl}
                alt="Employee"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load image");
                  e.target.src = "/placeholder.png";
                }}
              />
            </div>
            
            <div className="w-full flex flex-col">
              <button
                type="button"
                onClick={handleStartCapture}
                className="w-full py-2 bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
              >
                {validPhoto ? "Change Photo" : "Take Photo"}
              </button>
              
              {validPhoto && onRemovePhoto && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="w-full py-2 bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}