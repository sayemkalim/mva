import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Bell,
  Maximize,
  Minimize,
  Sun,
  Moon,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { useTheme } from "../theme";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNotificationContext } from "@/context/NotificationContext";
import {
  getAllNotification,
  getUnreadCount,
  readNotificationById,
  readAllNotifications,
  readMultipleNotifications,
  deleteNotificationById,
  deleteAllNotifications,
  respondToNotification,
} from "./helper";

export function Navbar2() {
  const queryClient = useQueryClient();

  // Get real-time notifications from WebSocket
  const {
    notifications: wsNotifications,
    clearNotification: clearWsNotification,
    clearAll: clearWsAll,
  } = useNotificationContext();

  // Fullscreen logic
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [loadingAction, setLoadingAction] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  // Timer logic
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Fetch notifications using TanStack Query
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await getAllNotification();
      if (response?.response?.data) {
        return response.response.data;
      } else if (response?.response) {
        return response.response;
      }
      return [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Fetch unread count using TanStack Query
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const response = await getUnreadCount();
      if (response?.response?.count !== undefined) {
        return response.response.count;
      } else if (response?.response?.unread_count !== undefined) {
        return response.response.unread_count;
      }
      return 0;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: (id) => readNotificationById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mutation for marking multiple as read
  const markMultipleAsReadMutation = useMutation({
    mutationFn: (ids) => readMultipleNotifications(ids),
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mutation for deleting single notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => deleteNotificationById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mutation for deleting all notifications
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      clearWsAll();
    },
  });

  // Mutation for responding to action notifications
  const respondMutation = useMutation({
    mutationFn: ({ id, action }) => respondToNotification(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleTheme = () => {
    const effectiveTheme = theme === "system" ? "light" : theme;
    const newTheme = effectiveTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const timerDisplay = new Date(seconds * 1000).toISOString().substr(11, 8);

  // Format time for display
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

  // Mark single notification as read
  const markAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  // Handle action (accept/reject)
  const handleAction = async (notificationId, action) => {
    setLoadingAction((prev) => ({ ...prev, [notificationId]: action }));
    try {
      await respondMutation.mutateAsync({ id: notificationId, action });
      clearWsNotification(notificationId);
    } catch (error) {
      console.error("Failed to send notification response:", error);
    } finally {
      setLoadingAction((prev) => ({ ...prev, [notificationId]: null }));
    }
  };

  // Clear single notification
  const clearNotification = (id) => {
    deleteNotificationMutation.mutate(id);
    clearWsNotification(id);
  };

  // Clear all notifications
  const clearAll = () => {
    deleteAllMutation.mutate();
  };

  // Combine API notifications with WebSocket real-time notifications
  const allNotifications = notificationsData || [];

  // notification count
  const notificationCount = unreadCountData || allNotifications?.length || 0;

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-muted">
      {/* Left side: SidebarTrigger */}
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
      </div>

      {/* Center: Timer Controls */}
      <div className="flex items-center gap-2 bg-white rounded px-2 py-1 shadow">
        <Button
          onClick={
            !isActive ? handleStart : isPaused ? handleResume : handlePause
          }
          variant="outline"
        >
          {!isActive ? "Start" : isPaused ? "Resume" : "Pause"}
        </Button>
        <div className="font-mono text-lg min-w-[100px]">{timerDisplay}</div>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={!isActive && seconds === 0}
        >
          Reset
        </Button>
      </div>

      {/* Right side: Other buttons */}
      <div className="flex items-center gap-4">
        <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <Button
            variant="ghost"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="h-6 w-6" />
            ) : (
              <Maximize className="h-6 w-6" />
            )}
          </Button>
        </Tooltip>

        {/* Notification Bell with Badge */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Tooltip content="Notifications">
              <Button
                variant="ghost"
                className="relative"
                aria-label="Notifications"
                onClick={() => setSheetOpen(true)}
              >
                <Bell className="h-8 w-8" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full">
                    {notificationCount > 10 ? "10+" : notificationCount}
                  </span>
                )}
              </Button>
            </Tooltip>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[450px]">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Notifications</SheetTitle>
                <div className="flex items-center gap-2">
                  {allNotifications.some((n) => !n.is_read) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={markAllAsReadMutation.isPending}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      {markAllAsReadMutation.isPending ? "..." : "Read All"}
                    </Button>
                  )}
                  {allNotifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      disabled={deleteAllMutation.isPending}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {deleteAllMutation.isPending ? "..." : "Clear All"}
                    </Button>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* Selection controls */}
            {allNotifications.length > 0 && (
              <div className="flex items-center justify-between py-2 px-1 border-b mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length ===
                        allNotifications.filter((n) => !n.is_read).length &&
                      selectedIds.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(
                          allNotifications
                            .filter((n) => !n.is_read)
                            .map((n) => n.id || n.notificationId)
                        );
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-600">
                    {selectedIds.length > 0
                      ? `${selectedIds.length} selected`
                      : "Select all unread"}
                  </span>
                </div>
                {selectedIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      markMultipleAsReadMutation.mutate(selectedIds)
                    }
                    disabled={markMultipleAsReadMutation.isPending}
                    className="text-xs h-7"
                  >
                    {markMultipleAsReadMutation.isPending
                      ? "Marking..."
                      : `Mark ${selectedIds.length} as Read`}
                  </Button>
                )}
              </div>
            )}

            <div className="mt-3 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-sm">Loading notifications...</p>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                allNotifications.map((n) => (
                  <div
                    key={n.notificationId || n.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      n.is_read
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    } hover:bg-gray-100`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox for unread notifications */}
                      {!n.is_read && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            n.id || n.notificationId
                          )}
                          onChange={(e) => {
                            const id = n.id || n.notificationId;
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, id]);
                            } else {
                              setSelectedIds((prev) =>
                                prev.filter((i) => i !== id)
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 mt-1 flex-shrink-0"
                        />
                      )}
                      {n.profile && (
                        <img
                          src={n.profile}
                          alt={n.name}
                          className="h-10 w-10 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {n.name}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(n.time || n.receivedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {n.message}
                        </p>

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
                              {loadingAction[n.id || n.notificationId] ===
                              "accept"
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
                              {loadingAction[n.id || n.notificationId] ===
                              "reject"
                                ? "..."
                                : "Reject"}
                            </Button>
                          </div>
                        )}

                        {/* Action links for non-action notifications */}
                        {n.type !== "action" && (
                          <div className="flex items-center gap-3 mt-2">
                            {!n.is_read && (
                              <button
                                onClick={() =>
                                  markAsRead(n.id || n.notificationId)
                                }
                                disabled={markAsReadMutation.isPending}
                                className="text-xs text-green-600 hover:text-green-800"
                              >
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() =>
                                clearNotification(n.id || n.notificationId)
                              }
                              className="text-xs text-blue-500 hover:text-blue-700"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Close button */}
                      <button
                        onClick={() =>
                          clearNotification(n.id || n.notificationId)
                        }
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Tooltip
          content={
            theme === "light"
              ? "Switch to Dark Mode"
              : theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Light/Dark Mode"
          }
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Sun className="h-8 w-8" />
            ) : theme === "dark" ? (
              <Moon className="h-8 w-8" />
            ) : (
              <Sun className="h-8 w-8" />
            )}
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
}
