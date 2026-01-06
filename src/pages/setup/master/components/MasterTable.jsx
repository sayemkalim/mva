import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2, Eye } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { fetchMasterList } from "../helpers/fetchMasterList";
import { deleteMaster } from "../helpers/deleteMaster";
import { updateMasterStatus } from "../helpers/updateMasterStatus";
import ViewMasterDialog from "./ViewMasterDialog";

const MasterTable = ({ slug, setMasterLength, onEdit, params }) => {
  const queryClient = useQueryClient();

  const {
    data: apiMasterResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["masterList", slug, params?.search],
    queryFn: () => fetchMasterList(slug),
    enabled: !!slug,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [viewMasterId, setViewMasterId] = useState(null);

  const onOpenDialog = (row) => {
    setOpenDelete(true);
    setSelectedMaster(row);
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedMaster(null);
  };

  const { mutate: deleteMasterMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (id) => deleteMaster(id),
    onSuccess: () => {
      toast.success("Master record deleted successfully.");
      queryClient.invalidateQueries(["masterList", slug]);
      onCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete master record.");
    },
  });

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: ({ id, isActive }) => updateMasterStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["masterList", slug]);

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["masterList", slug]);

      // Optimistically update to the new value
      queryClient.setQueryData(["masterList", slug], (old) => {
        if (!old?.response?.data) return old;
        
        return {
          ...old,
          response: {
            ...old.response,
            data: old.response.data.map((item) =>
              item.id === id ? { ...item, is_active: isActive } : item
            ),
          },
        };
      });

      // Return context with previous data
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Status updated successfully.");
      queryClient.invalidateQueries(["masterList", slug]);
    },
    onError: (err, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(["masterList", slug], context.previousData);
      }
      toast.error("Failed to update status.");
    },
  });

  const onDelete = () => {
    if (selectedMaster?.id) {
      deleteMasterMutation(selectedMaster.id);
    }
  };

  const handleStatusToggle = (row, newStatus) => {
    updateStatusMutation({
      id: row.id,
      isActive: newStatus,
    });
  };

  const masters = Array.isArray(apiMasterResponse?.response?.data)
    ? apiMasterResponse.response.data
    : [];

  // Filter masters based on search
  const filteredMasters = masters.filter((master) => {
    if (!params?.search) return true;
    const searchLower = params.search.toLowerCase();
    return (
      master.name?.toLowerCase().includes(searchLower) ||
      master.description?.toLowerCase().includes(searchLower) ||
      master.id?.toString().includes(searchLower)
    );
  });

  useEffect(() => {
    setMasterLength(filteredMasters.length);
  }, [filteredMasters, setMasterLength]);

  const columns = [
    {
      key: "id",
      label: "Sl. No",
      render: (value, row, index) => (
        <Typography variant="p">{index + 1}</Typography>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "description",
      label: "Description",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "is_active",
      label: "Status",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value === true || value === 1}
            onCheckedChange={(checked) => handleStatusToggle(row, checked)}
          />
          <span className="text-sm">
            {value === true || value === 1 ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <ActionMenu
          options={[
            {
              label: "Edit",
              icon: Pencil,
              action: () => onEdit(row),
            },
            {
              label: "Delete",
              icon: Trash2,
              action: () => onOpenDialog(row),
              className: "text-red-500",
            },
            {
              label: "View",
              icon: Eye,
              action: () => {
                setViewMasterId(row.id);
                setOpenView(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <CustomTable
        columns={columns}
        data={filteredMasters}
        isLoading={isLoading}
        error={error}
      />
      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={selectedMaster?.name || "this record"}
        modalType="Delete"
        onDelete={onDelete}
        id={selectedMaster?.id}
        isLoading={isDeleting}
      />
      <ViewMasterDialog
        open={openView}
        onClose={() => setOpenView(false)}
        masterId={viewMasterId}
      />
    </>
  );
};

export default MasterTable;
