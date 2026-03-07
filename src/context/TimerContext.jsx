import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { getItem } from "@/utils/local_storage";

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
  const activityIdRef = useRef(null);

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
      activityIdRef.current = null;
    }
    
    // If entering a workstation, fetch running time from API
    if (currentSlug && currentSlug !== currentSlugRef.current) {
      const syncFromServer = async () => {
        try {
          const res = await apiService({
            endpoint: `${endpoints.activityRunningTime}/${currentSlug}`,
            method: "GET",
          });
          const data = res?.response?.data;
          if (data && (data.status === "running" || data.status === "paused")) {
            if (data.id) activityIdRef.current = data.id;
            const serverSeconds = data.total_seconds ?? 0;
            setSeconds(serverSeconds);
            if (data.status === "running") {
              setIsActive(true);
              setIsPaused(false);
            } else {
              // paused
              setIsActive(true);
              setIsPaused(true);
            }
            // Also persist locally so offline reload works
            saveSlugTimer(currentSlug, {
              seconds: serverSeconds,
              isActive: data.status === "running",
              isPaused: data.status === "paused",
            });
            return;
          }
        } catch (err) {
          console.error("Failed to fetch running time from server", err);
        }

        // Fallback: restore from localStorage
        const savedData = loadSlugTimer(currentSlug);
        if (savedData) {
          let newSeconds = savedData.seconds;
          if (savedData.isActive && !savedData.isPaused) {
            const elapsed = Math.floor((Date.now() - savedData.timestamp) / 1000);
            newSeconds = savedData.seconds + elapsed;
          }
          setSeconds(newSeconds);
          setIsActive(savedData.isActive);
          setIsPaused(savedData.isPaused);
        } else {
          setSeconds(0);
          setIsActive(false);
          setIsPaused(false);
        }
      };

      syncFromServer();
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
  const handleStart = async () => {
    if (!isInWorkstation()) {
      return { success: false, message: "Timer can only be started in workstation files" };
    }

    const currentSlug = getCurrentSlug();

    // Call start API
    try {
      const res = await apiService({
        endpoint: `${endpoints.activityStart}/${currentSlug}`,
        method: "POST",
      });
      if (res?.response?.data?.id) {
        activityIdRef.current = res.response.data.id;
      } else if (res?.response?.id) {
        activityIdRef.current = res.response.id;
      }
    } catch (err) {
      console.error("Activity start API error", err);
    }

    setIsActive(true);
    setIsPaused(false);

    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds,
        isActive: true,
        isPaused: false,
      });
    }

    return { success: true };
  };

  const handlePause = async () => {
    // Call pause API if we have an activity id
    if (activityIdRef.current) {
      try {
        await apiService({
          endpoint: `${endpoints.activityPause}/${activityIdRef.current}`,
          method: "POST",
        });
      } catch (err) {
        console.error("Activity pause API error", err);
      }
    }

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

  const handleResume = async () => {
    if (!isInWorkstation()) {
      return { success: false, message: "Timer can only be resumed in workstation files" };
    }

    const currentSlug = getCurrentSlug();

    // Resume = start a fresh activity session
    try {
      const res = await apiService({
        endpoint: `${endpoints.activityStart}/${currentSlug}`,
        method: "POST",
      });
      if (res?.response?.data?.id) {
        activityIdRef.current = res.response.data.id;
      } else if (res?.response?.id) {
        activityIdRef.current = res.response.id;
      }
    } catch (err) {
      console.error("Activity resume (start) API error", err);
    }

    setIsPaused(false);

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
    activityIdRef.current = null;

    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds: 0,
        isActive: false,
        isPaused: false,
      });
    }
  };

  // Stop timer and call stop API with billing data
  const handleStop = async ({ task, description, billing_status_id, timekeeper_id } = {}) => {
    const activityId = activityIdRef.current;

    if (activityId) {
      const userId = getItem("userId");
      try {
        await apiService({
          endpoint: `${endpoints.activityStop}/${activityId}`,
          method: "POST",
          data: {
            task: task || "",
            description: description || "",
            billing_status_id: billing_status_id ?? undefined,
            timekeeper_id: timekeeper_id ?? userId ?? undefined,
          },
        });
      } catch (err) {
        console.error("Activity stop API error", err);
      }
    }

    // Reset local timer state
    setSeconds(0);
    setIsActive(false);
    setIsPaused(false);
    activityIdRef.current = null;

    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      saveSlugTimer(currentSlug, {
        seconds: 0,
        isActive: false,
        isPaused: false,
      });
    }

    return { success: true };
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
      activityIdRef.current = null;
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
    handleStop,
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