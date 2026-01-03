import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getEcho } from "@/hooks/echo";
import { getItem } from "@/utils/local_storage";

const NotificationContext = createContext({
  notifications: [],
  clearNotification: () => {},
  clearAll: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

// Ask permission for desktop notifications
const requestDesktopPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const result = await Notification.requestPermission();
    return result === "granted";
  }
  return false;
};

// Show system-level notification
const showDesktopNotification = (notification) => {
  if (Notification.permission !== "granted") return;

  try {
    const desktopNotif = new Notification(
      notification.name || "New Notification",
      {
        body: notification.message || "",
        icon: notification.profile || "/favicon.ico",
        tag: notification.notificationId || notification.id,
        requireInteraction: notification.type === "action",
        silent: false,
      }
    );

    if (notification.type !== "action") {
      setTimeout(() => desktopNotif.close(), 8000);
    }

    desktopNotif.onclick = () => {
      window.focus();
      desktopNotif.close();
    };
  } catch (error) {
    console.error("Desktop notification error:", error);
  }
};

const processedIds = new Set();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);

  const userId = getItem("userId");

  // Notification sound
  useEffect(() => {
    audioRef.current = new Audio("/notification-sound/notification.wav");
    audioRef.current.volume = 0.7;
    const unlock = () => {
      audioRef.current
        ?.play()
        .then(() => audioRef.current.pause())
        .catch(() => {});
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, []);

  const playSound = () => {
    const audio = audioRef.current?.cloneNode();
    if (audio) {
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    requestDesktopPermission();
  }, []);

  /* WebSocket subscription */
  useEffect(() => {
    if (!userId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `user.${userId}`;
    const channel = echo.private(channelName);

    const handleNotification = (payload) => {
      let data;

      try {
        data =
          typeof payload === "string"
            ? JSON.parse(payload)
            : payload?.data
            ? typeof payload.data === "string"
              ? JSON.parse(payload.data)
              : payload.data
            : payload;
      } catch {
        return;
      }

      const notification = {
        ...data,
        receivedAt: new Date().toISOString(),
      };

      const id = notification.notificationId || notification.id;

      // Skip if already processed
      if (processedIds.has(id)) {
        return;
      }
      processedIds.add(id);

      // Play sound
      playSound();

      // Show desktop notification
      showDesktopNotification(notification);

      // Add to state
      setNotifications((prev) => {
        if (prev.some((n) => (n.notificationId || n.id) === id)) {
          return prev;
        }
        return [notification, ...prev];
      });
    };

    // Listen to events
    channel.listen(".MessageSent", handleNotification);

    return () => {
      echo.leave(channelName);
    };
  }, [userId]);

  const clearNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => (n.notificationId || n.id) !== id)
    );
  };

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{ notifications, clearNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
