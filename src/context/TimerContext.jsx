import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const TimerContext = createContext();

const TIMER_STORAGE_KEY = "workstation-timers";

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const location = useLocation();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const currentSlugRef = useRef(null);

  // Extract slug from workstation URL
  const getCurrentSlug = () => {
    const pathname = location.pathname;
    const workstationMatch = pathname.match(/\/dashboard\/workstation\/edit\/([^\/]+)/);
    return workstationMatch ? workstationMatch[1] : null;
  };

  // Check if current route is a workstation
  const isInWorkstation = () => {
    return location.pathname.includes('/dashboard/workstation/edit/');
  };

  // Save timer data for specific slug
  const saveSlugTimer = (slug, timerData) => {
    if (!slug) return;
    
    const existingData = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY) || '{}');
    existingData[slug] = {
      ...timerData,
      timestamp: Date.now(),
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(existingData));
  };

  // Load timer data for specific slug
  const loadSlugTimer = (slug) => {
    if (!slug) return null;
    
    const existingData = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY) || '{}');
    return existingData[slug] || null;
  };

  // Handle route changes
  useEffect(() => {
    const currentSlug = getCurrentSlug();
    
    // If leaving a workstation, save current timer state
    if (currentSlugRef.current && currentSlugRef.current !== currentSlug) {
      saveSlugTimer(currentSlugRef.current, {
        seconds,
        isActive,
        isPaused,
      });
      
      // Stop timer when leaving workstation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsActive(false);
      setIsPaused(false);
      setSeconds(0);
    }
    
    // If entering a workstation, load timer state
    if (currentSlug && currentSlug !== currentSlugRef.current) {
      const savedData = loadSlugTimer(currentSlug);
      if (savedData) {
        let newSeconds = savedData.seconds;
        
        // If timer was active when leaving, calculate elapsed time
        if (savedData.isActive && !savedData.isPaused) {
          const elapsed = Math.floor((Date.now() - savedData.timestamp) / 1000);
          newSeconds = savedData.seconds + elapsed;
        }
        
        setSeconds(newSeconds);
        setIsActive(savedData.isActive);
        setIsPaused(savedData.isPaused);
        
        // Resume timer if it was active
        if (savedData.isActive && !savedData.isPaused) {
          setIsActive(true);
          setIsPaused(false);
        }
      } else {
        // New workstation, reset timer
        setSeconds(0);
        setIsActive(false);
        setIsPaused(false);
      }
    }
    
    // If not in workstation, reset everything
    if (!currentSlug) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSeconds(0);
      setIsActive(false);
      setIsPaused(false);
    }
    
    currentSlugRef.current = currentSlug;
  }, [location.pathname]);

  // Main timer effect
  useEffect(() => {
    if (isActive && !isPaused && isInWorkstation()) {
      intervalRef.current = setInterval(() => {
        setSeconds(seconds => {
          const newSeconds = seconds + 1;
          
          // Auto-save every 30 seconds
          if (newSeconds % 30 === 0) {
            const currentSlug = getCurrentSlug();
            if (currentSlug) {
              saveSlugTimer(currentSlug, {
                seconds: newSeconds,
                isActive: true,
                isPaused: false,
              });
            }
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, location.pathname]);

  // Timer functions
  const handleStart = () => {
    if (!isInWorkstation()) {
      return { success: false, message: "Timer can only be started in workstation files" };
    }
    
    setIsActive(true);
    setIsPaused(false);
    
    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds,
        isActive: true,
        isPaused: false,
      });
    }
    
    return { success: true };
  };

  const handlePause = () => {
    setIsPaused(true);
    
    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds,
        isActive,
        isPaused: true,
      });
    }
  };

  const handleResume = () => {
    if (!isInWorkstation()) {
      return { success: false, message: "Timer can only be resumed in workstation files" };
    }
    
    setIsPaused(false);
    
    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds,
        isActive,
        isPaused: false,
      });
    }
    
    return { success: true };
  };

  const handleReset = () => {
    setSeconds(0);
    setIsActive(false);
    setIsPaused(false);
    
    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds: 0,
        isActive: false,
        isPaused: false,
      });
    }
  };

  // Explicit exit file method
  const handleExitFile = () => {
    const currentSlug = getCurrentSlug();
    if (currentSlug && (isActive || isPaused || seconds > 0)) {
      // Save current state immediately
      saveSlugTimer(currentSlug, {
        seconds,
        isActive: false, // Stop the timer when exiting
        isPaused: false,
      });
      
      // Stop timer immediately
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsActive(false);
      setIsPaused(false);
      // Keep seconds display until route actually changes
    }
  };

  // Format time for display
  const timerDisplay = new Date(seconds * 1000).toISOString().substring(11, 19);

  const value = {
    seconds,
    isActive,
    isPaused,
    timerDisplay,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    handleExitFile,
    isInWorkstation: isInWorkstation(),
    currentSlug: getCurrentSlug(),
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};