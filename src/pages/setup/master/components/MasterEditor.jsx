import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { formatSlugToTitle } from "../helpers/formatSlugToTitle";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-label";

const MasterEditor = ({ open, onClose, slug, masterData = null }) => {
  const queryClient = useQueryClient();
  const isEdit = !!masterData;
  
  // Dynamic page title
  const pageTitle = formatSlugToTitle(slug);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (masterData) {
      setFormData({
        name: masterData.name || "",
        description: masterData.description || "",
        is_active: masterData.is_active === true || masterData.is_active === 1,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        is_active: true,
      });
    }
  }, [masterData, open]);

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      formDataToSend.append("is_active", data.is_active ? 1 : 0);

      // Different endpoint patterns for create vs update
      const endpoint = isEdit
        ? `${endpoints.updateMaster}/${masterData.id}`
        : `${endpoints.createMaster}/${slug}`; // Add slug to URL for create

      const response = await apiService({
        endpoint: endpoint,
        method: isEdit ? "PUT" : "POST",
        data: formDataToSend,
      });
      return response;
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? `${pageTitle} record updated successfully!`
          : `${pageTitle} record created successfully!`
      );
      queryClient.invalidateQueries(["masterList", slug]);
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.message ||
          `Failed to ${isEdit ? "update" : "create"} ${pageTitle} record.`
      );
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    createOrUpdateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${pageTitle}` : `Add ${pageTitle}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <FloatingInput
              label="Name"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <FloatingTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label className="text-foreground font-medium cursor-pointer">
              Active Status
            </Label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createOrUpdateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createOrUpdateMutation.isPending}>
              {createOrUpdateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MasterEditor;
