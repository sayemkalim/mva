import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

//get role list
export const getRoleList = async () => {
  const response = await apiService({
    endpoint: endpoints.rolesList,
    method: "GET",
  });
  return response;
};
//get permissions list
export const getPermissionsList = async () => {
  const response = await apiService({
    endpoint: endpoints.permissionsList,
    method: "GET",
  });
  return response;
};
//create role
export const createRole = async (data) => {
  const response = await apiService({
    endpoint: endpoints.createRole,
    method: "POST",
    data: data,
  });
  return response;
};
//show role
export const showRole = async (id) => {
  const response = await apiService({
    endpoint: `${endpoints.showRole}/${id}`,
    method: "GET",
  });
  return response;
};
//update role
export const updateRole = async (id, data) => {
  const response = await apiService({
    endpoint: `${endpoints.updateRole}/${id}`,
    method: "PUT",
    data: data,
  });
  return response;
};
//delete role
export const deleteRole = async (id) => {
  const response = await apiService({
    endpoint: `${endpoints.deleteRole}/${id}`,
    method: "DELETE",
  });
  return response;
};
