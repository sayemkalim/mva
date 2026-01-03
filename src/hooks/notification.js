import { useEffect, useState } from "react";
import { getEcho } from "./echo";

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ useNotifications: No userId provided");
      return;
    }

    const echo = getEcho();

    if (!echo) {
      console.error(
        "Echo instance not available. User may not be logged in."
      );
      return;
    }

    const channelName = `user.${userId}`;

    const channel = echo.private(channelName);

    channel.subscribed(() => {
      console.log("Successfully subscribed to:", channelName);
    });

    channel.error((error) => {
      console.error("Channel error:", error);
    });

    channel.listen("MessageSent", (data) => {

      // Parse the data if it's a string
      let notificationData = data;
      if (typeof data === "string") {
        try {
          notificationData = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse notification data:", e);
        }
      }

      // Add received timestamp
      const notification = {
        ...notificationData,
        receivedAt: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      console.log("Notification received:", notification);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [userId]);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
  };

  const clearAll = () => setNotifications([]);

  return {
    notifications,
    clearNotification,
    clearAll,
  };
}
