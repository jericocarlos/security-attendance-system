'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import HIDListener from '@/lib/HIDListeners';
import Clock from '@/components/Clock';
import EmployeeCard from '@/components/layout/home/EmployeeCard';
import EmployeePhoto from '@/components/layout/home/EmployeePhoto';
import ErrorDisplay from '@/components/layout/home/ErrorDisplay';
import useAttendance from '@/hooks/useAttendance';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { ANIMATIONS } from '@/constants';

export default function Home() {
  const {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    showInstructions,
    handleTagRead,
    clearEmployeeInfo,
    loading // <-- Destructure loading
  } = useAttendance();

  const [announcementTextSlides, setAnnouncementTextSlides] = useState([]);
  const [announcementImages, setAnnouncementImages] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const { ToastContainer, success, error: toastError } = useToast();

  const carouselSlides = [
    {
      title: 'Welcome to EastWest BPO',
      body: 'Stay informed with the latest news, training updates, safety reminders, and company highlights while you clock in.'
    },
    {
      title: 'Tip of the day',
      body: 'Always keep your ID card visible and ready. This helps ensure a faster, smoother check-in experience.'
    },
    ...announcementImages.map(img => ({
      title: img.title || 'Announcement',
      body: null,
      isImageOnly: true,
      imagePath: img.imagePath
    })),
    ...announcementTextSlides
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  // Fetch announcement message from database
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // Fetch all announcements with enabled status
        const response = await fetch('/api/admin/announcements?status=enabled&limit=100');
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Show attachment-free announcements as text slides.
            const textSlides = data.data.reduce((slides, announcement) => {
              if (announcement.attachment) return slides;

              const text = announcement.announcement || announcement.announcement1 || '';
              const body = typeof text === 'string' ? text.trim() : String(text).trim();
              if (body) {
                slides.push({
                  title: announcement.title || 'Announcement',
                  body,
                  isImageOnly: false,
                });
              }
              return slides;
            }, []);
            setAnnouncementTextSlides(textSlides);

            // Parse all announcements with images.
            const imageSlides = [];
            for (const announcement of data.data) {
              if (announcement.attachment) {
                try {
                  let attachments = [];
                  if (typeof announcement.attachment === 'string') {
                    try {
                      const parsed = JSON.parse(announcement.attachment);
                      attachments = Array.isArray(parsed) ? parsed : [parsed];
                    } catch (e) {
                      attachments = [announcement.attachment];
                    }
                  } else if (Array.isArray(announcement.attachment)) {
                    attachments = announcement.attachment;
                  }

                  if (Array.isArray(attachments) && attachments.length > 0) {
                    const sortedAttachments = [...attachments].sort((a, b) =>
                      String(a).localeCompare(String(b))
                    );

                    // Get the first image that ends with image extensions in ascending order
                    const imagePath = sortedAttachments.find(path => 
                      typeof path === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
                    ) || sortedAttachments[0];
                    
                    if (imagePath) {
                      imageSlides.push({
                        title: announcement.title || 'Announcement',
                        imagePath: imagePath
                      });
                    }
                  }
                } catch (parseErr) {
                  console.error('Failed to parse attachment:', parseErr);
                }
              }
            }

            const sortedImageSlides = [...imageSlides].sort((a, b) =>
              String(a.imagePath).localeCompare(String(b.imagePath))
            );
            
            setAnnouncementImages(sortedImageSlides);
          } else {
            setAnnouncementTextSlides([]);
            setAnnouncementImages([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch announcement:', err);
        // Keep default announcement if fetch fails
      }
    };

    fetchAnnouncement();
  }, []);

  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      {/* Clock component at the top */}
      <motion.div 
        className="pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Clock />
      </motion.div>

      {/* Conditional main content */}
      <div className="container my-5 mx-auto px-8 pb-20">
        {/* Instructions or welcome message */}
        <AnimatePresence>
          {showInstructions && !error && (
            <motion.div 
              className="text-center my-10"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={ANIMATIONS.fadeIn}
            >
              <motion.h2 
                className="text-5xl font-bold text-cyan-300"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Please Tap Your ID Card
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Employee data display and right-side advertisement */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start"
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: 20 }}
          variants={ANIMATIONS.fadeIn}
        >
          {/* Left side - Employee Info */}
          <div className="md:fixed md:top-65 left-8 w-[850px] md:self-start">
            {employeeInfo && (
              <EmployeeCard 
                employeeInfo={employeeInfo} 
                attendanceLog={attendanceLog}
                employeeStatus={employeeStatus} 
              />
            )}
          </div>
          
          {/* Middle side - Photo and status */}
          <div className="md:fixed md:top-65 md:left-1/2 md:transform md:-translate-x-1/2 md:self-start">
            {employeeInfo && (
              <EmployeePhoto 
                employeeInfo={employeeInfo}
                employeeStatus={employeeStatus} 
              />
            )}
          </div>
        </motion.div>

        {/* Error display */}
        <AnimatePresence>
          {error && <ErrorDisplay error={error} />}
        </AnimatePresence>

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center mt-10">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-cyan-500"></div>
            <span className="ml-6 text-3xl text-cyan-500 font-bold">Processing...</span>
          </div>
        )}
      </div>

      {/* Fixed top-right advertisement panel */}
      <div className="hidden md:flex fixed top-8 right-8 z-20 ml-auto h-[1080px] w-[785px] flex-col rounded-3xl border border-cyan-400/30 bg-white/5 p-6 shadow-xl shadow-cyan-950/30 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.3em] text-cyan-200 opacity-80">
          <span>Announcement</span>
          <div className="flex gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${activeSlide === index ? 'bg-cyan-300' : 'bg-cyan-100/40'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${carouselSlides[activeSlide].title}-${activeSlide}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-2xl bg-cyan-950/70 p-5 text-white shadow-inner shadow-cyan-950/20 flex flex-col"
            >
              <h3 className="text-2xl font-semibold text-cyan-100">
                {typeof carouselSlides[activeSlide].title === 'string' 
                  ? carouselSlides[activeSlide].title 
                  : String(carouselSlides[activeSlide].title || '')}
              </h3>
              
              {/* Display image for image-only slide */}
              {carouselSlides[activeSlide].isImageOnly && carouselSlides[activeSlide].imagePath && (
                <div className="flex-1 relative w-full rounded-lg overflow-hidden my-3">
                  <img 
                    src={carouselSlides[activeSlide].imagePath} 
                    alt="Announcement" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Display text for text-only announcements */}
              {carouselSlides[activeSlide].body && (
                <p className="mt-2 text-sm leading-6 text-cyan-200">
                  {typeof carouselSlides[activeSlide].body === 'string' 
                    ? carouselSlides[activeSlide].body 
                    : String(carouselSlides[activeSlide].body || '')}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
            className="rounded-full border border-cyan-400/30 px-3 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/10"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev + 1) % carouselSlides.length)}
            className="rounded-full border border-cyan-400/30 px-3 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/10"
          >
            Next
          </button>
        </div> */}
      </div>

      <div className="fixed bottom-0 left-0 z-30 w-full">
        {/* <motion.div
          className="w-full overflow-hidden border-y border-cyan-400/40 bg-cyan-950/90 py-3 shadow-lg shadow-cyan-950/30 backdrop-blur-md"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          role="status"
          aria-label={announcementMessage}
        >
          <div className="flex w-max animate-announcement whitespace-nowrap text-2xl font-bold uppercase tracking-normal text-yellow-200">
            <span className="px-10">{announcementMessage}</span>
            <span className="px-10" aria-hidden="true">{announcementMessage}</span>
            <span className="px-10" aria-hidden="true">{announcementMessage}</span>
          </div>
        </motion.div> */}

        {/* Company branding footer */}
        <div className="w-full border-t border-cyan-400/40 bg-black/50 backdrop-blur-md">
          <div className="container mx-auto relative flex justify-between items-center px-8">
            {/* Title on the left */}
            <div className="text-2xl font-bold">Security Attendance System</div>
            
            {/* Spinner absolutely centered */}
            {loading && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-cyan-500"></div>
              </div>
            )}

            {/* Logo on the right */}
            <div>
              <Image
                src="/ew-logo-full.png" 
                alt="EWBPO Logo" 
                width={300}
                height={53}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer />

      {/* HID Listener */}
      <HIDListener onTagRead={handleTagRead} />
    </div>
  );
}
