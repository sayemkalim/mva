import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { Loader2 } from "lucide-react";

const ViewMasterDialog = ({ open, onClose, masterId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["masterDetail", masterId],
    queryFn: async () => {
      const response = await apiService({
        endpoint: `${endpoints.showMaster}/${masterId}`,
        method: "GET",
      });
      return response;
    },
    enabled: !!masterId && open,
  });

  const masterData = data?.response?.data || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Master Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-base">{masterData.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-base">{masterData.description || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1 text-base">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    masterData.is_active === true || masterData.is_active === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {masterData.is_active === true || masterData.is_active === 1
                    ? "Active"
                    : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewMasterDialog;
