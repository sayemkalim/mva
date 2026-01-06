import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { getItem, setItem, removeItem } from "@/utils/local_storage";

const PERMISSIONS_KEY = "permissions";

// Fetch permissions for a given role ID from the API
export const fetchUserPermissions = async (roleId) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.showRole}/${roleId}`,
      method: "GET",
    });

    const roleData = response?.data || response?.response?.data || {};
    const permissions = roleData?.permissions || [];
    const permissionNames = permissions.map((p) => p.name);
    return permissionNames;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }
};

// Refresh current user's permissions from the API
export const refreshUserPermissions = async () => {
  try {
    const userRole = getItem("userRole");
    if (!userRole) {
      console.warn("No user role found, cannot refresh permissions");
      return false;
    }

    const permissions = await fetchUserPermissions(userRole);
    setPermissions(permissions);
    
    // notify components that permissions have changed
    window.dispatchEvent(new CustomEvent("permissionsUpdated", { detail: { permissions } }));
    
    return true;
  } catch (error) {
    console.error("Error refreshing permissions:", error);
    return false;
  }
};

export const setPermissions = (permissions) => {
  setItem({ [PERMISSIONS_KEY]: permissions });
};

// Get permissions from localStorage
export const getPermissions = () => {
  try {
    const stored = getItem(PERMISSIONS_KEY);
    if (!stored) return [];
    if (Array.isArray(stored)) {
      return stored;
    }
    if (typeof stored === "string") {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Error parsing permissions:", error);
    return [];
  }
};

//   Check if user has a permission

export const hasPermission = (permissionName) => {
  const permissions = getPermissions();
  return permissions.includes(permissionName);
};

//  Clear permissions

export const clearPermissions = () => {
  removeItem(PERMISSIONS_KEY);
};

