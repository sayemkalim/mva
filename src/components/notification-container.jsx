import { useState, useEffect } from "react";
import { X, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { apiService } from "@/api/api_service/apiService";

const AUTO_DISMISS_MS = 5000; // Auto hide toast after 5 seconds

const getTypeIcon = (type) => {
  switch (type) {
    case "action":
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case "action":
      return "border-l-orange-500";
    case "success":
      return "border-l-green-500";
    case "info":
      return "border-l-blue-500";
    default:
      return "border-l-gray-500";
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  try {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return "";
  }
};

// Single notification toast item with auto-hide (but NOT removed from sidebar)
function NotificationItem({
  notification,
  onHide,
  handleAction,
  loadingAction,
}) {
  const n = notification;
  const [isExiting, setIsExiting] = useState(false);

  // Auto-hide notifications 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onHide(n.notificationId || n.id);
      }, 300);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [n.notificationId, n.id, onHide]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onHide(n.notificationId || n.id);
    }, 300);
  };

  return (
    <div
      className={`bg-white shadow-xl rounded-lg border-l-4 ${getTypeColor(
        n.type
      )} overflow-hidden transition-all duration-300 ${
        isExiting
          ? "opacity-0 translate-x-full"
          : "animate-in slide-in-from-right"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {n.profile && (
            <img
              src={n.profile}
              alt={n.name}
              className="h-10 w-10 rounded-full flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Header with name and time */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm">{n.name}</h4>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatTime(n.time || n.receivedAt)}
              </span>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-700 mb-2">{n.message}</p>

            {/* Action buttons for type "action" */}
            {n.type === "action" && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() =>
                    handleAction(n.id || n.notificationId, "accept")
                  }
                  disabled={loadingAction[n.id || n.notificationId]}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1 h-7"
                >
                  {loadingAction[n.id || n.notificationId] === "accept"
                    ? "..."
                    : "Accept"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    handleAction(n.id || n.notificationId, "reject")
                  }
                  disabled={loadingAction[n.id || n.notificationId]}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 h-7"
                >
                  {loadingAction[n.id || n.notificationId] === "reject"
                    ? "..."
                    : "Reject"}
                </Button>
              </div>
            )}

            {/* Dismiss link for non-action notifications */}
            {n.type !== "action" && (
              <button
                onClick={handleDismiss}
                className="text-xs text-blue-500 hover:text-blue-700 mt-1"
              >
                Dismiss
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationContainer() {
  const { notifications, clearNotification } = useNotificationContext();
  const [loadingAction, setLoadingAction] = useState({});
  const [hiddenToasts, setHiddenToasts] = useState(new Set());

  // Hide toast from popup (but keep in sidebar/context)
  const hideToast = (id) => {
    setHiddenToasts((prev) => new Set([...prev, id]));
  };

  const handleAction = async (notificationId, action) => {
    setLoadingAction((prev) => ({ ...prev, [notificationId]: action }));

    try {
      await apiService({
        endpoint: "api/v2/notification-response",
        method: "POST",
        data: {
          id: notificationId,
          action: action,
        },
      });

      // Hide from toast popup after action
      hideToast(notificationId);
    } catch (error) {
      console.error("Failed to send notification response:", error);
    } finally {
      setLoadingAction((prev) => ({ ...prev, [notificationId]: null }));
    }
  };

  // Filter out hidden toasts
  const visibleNotifications =
    notifications?.filter((n) => !hiddenToasts.has(n.notificationId || n.id)) ||
    [];

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 w-[380px] z-50 space-y-3">
      {visibleNotifications.map((n) => (
        <NotificationItem
          key={n.notificationId || n.id}
          notification={n}
          onHide={hideToast}
          handleAction={handleAction}
          loadingAction={loadingAction}
        />
      ))}
    </div>
  );
}
