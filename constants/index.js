// Animation variants
export const ANIMATIONS = {
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }
};

// System settings
export const SETTINGS = {
  AUTO_CLEAR_TIMEOUT: 20000, // 20 seconds
};

// API endpoints
export const API = {
  ADD_ATTENDANCE: '/api/attendance/add',
};

// Status types
export const STATUS = {
  CLOCKED_IN: 'Clocked In',
  CLOCKED_OUT: 'Clocked Out',
};