"use client";

import { useState, useEffect, createContext, useContext } from "react";

// Create context for sidebar state
const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Load preference from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const storedState = localStorage.getItem("sidebarCollapsed");
    
    // Check for mobile viewport and default to collapsed on small screens
    const isMobile = window.innerWidth < 768;
    
    if (storedState !== null) {
      setIsCollapsed(storedState === "true");
    } else if (isMobile) {
      setIsCollapsed(true);
    }
  }, []);
  
  // Save preference to localStorage when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed, isMounted]);
  
  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook to use the sidebar context
export function useSidebarToggle() {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error("useSidebarToggle must be used within a SidebarProvider");
  }
  
  return context;
}