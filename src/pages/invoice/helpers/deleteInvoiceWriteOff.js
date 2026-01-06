import { apiService } from "@/api/api_service/apiService";

export const deleteInvoiceWriteOff = async (writeOffId) => {
  const { response, error } = await apiService({
    endpoint: `api/v2/file/accounting/invoice-write-off/delete/${writeOffId}`,
    method: "DELETE",
  });

  if (error) {
    throw new Error("Failed to delete write-off");
  }

  return response;
};
