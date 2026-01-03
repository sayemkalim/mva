import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

// Get all notifications
export const getAllNotification = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.getNotification,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.unreadNotification,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return null;
  }
};

// Mark single notification as read
export const readNotificationById = async (id) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.readNotificationById}/${id}`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

// Mark multiple notifications as read
export const readMultipleNotifications = async (ids) => {
  try {
    const response = await apiService({
      endpoint: endpoints.readMultipleNotification,
      method: "POST",
      data: { ids },
    });
    return response;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return null;
  }
};

// Mark all notifications as read
export const readAllNotifications = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.readAllNotification,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return null;
  }
};

// Delete single notification
export const deleteNotificationById = async (id) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.deleteNotificationById}/${id}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return null;
  }
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.deleteAllNotification,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return null;
  }
};

// Respond to action notification (accept/reject)
export const respondToNotification = async (id, action) => {
  try {
    const response = await apiService({
      endpoint: "api/v2/notification-response",
      method: "POST",
      data: { id, action },
    });
    return response;
  } catch (error) {
    console.error("Error responding to notification:", error);
    return null;
  }
};
