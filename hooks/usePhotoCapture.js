import { useState, useRef } from "react";

export default function usePhotoCapture(setFormData) {
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

    if (!canvas || !video) return;

    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 300, 300);

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;

    const photo = canvas.toDataURL("image/jpeg", 0.9);
    setFormData((prev) => ({ ...prev, photo }));
    setCapturing(false);
  };

  const handleRemovePhoto = (setterFn) => {
    setterFn(prev => ({
      ...prev,
      photo: ""
    }));
  };

  return {
    capturing,
    videoRef,
    canvasRef,
    handleStartCapture,
    handleCapturePhoto,
    handleRemovePhoto
  };
}