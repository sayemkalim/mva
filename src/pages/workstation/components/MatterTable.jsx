import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Eye, Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { fetchWorkstationList } from "../helpers/fetchWorkstationList";
import { deleteBlog } from "../helpers/deleteBlog";

const MatterTable = ({ setBlogsLength, params = {}, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiWorkstationResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workstationList", params],
    queryFn: () => fetchWorkstationList({ ...params }),
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);

  const onOpenDialog = (row) => {
    setOpenDelete(true);
    setSelectedWorkstation(row);
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedWorkstation(null);
  };

  const { mutate: deleteWorkstationMutation, isLoading: isDeleting } =
    useMutation({
      mutationFn: deleteBlog,
      onSuccess: () => {
        toast.success("Workstation deleted successfully.");
        queryClient.invalidateQueries(["workstationList"]);
        onCloseDialog();
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete workstation.");
      },
    });

  const workstations = Array.isArray(apiWorkstationResponse?.data)
    ? apiWorkstationResponse.data
    : Array.isArray(apiWorkstationResponse?.response?.data)
      ? apiWorkstationResponse.response.data
      : [];

  const paginationMeta = apiWorkstationResponse?.pagination || apiWorkstationResponse?.response?.pagination || {
    last_page: 1,
    current_page: 1,
    per_page: 25,
    total: 0,
  };

  // Save id and name to localStorage whenever workstations data changes
  useEffect(() => {
    if (workstations.length > 0) {
      const workstationData = workstations.map((workstation) => ({
        id: workstation.id,
        name: workstation.name,
        slug: workstation.slug,
      }));
      localStorage.setItem("workstationData", JSON.stringify(workstationData));
    }
  }, [workstations]);

  useEffect(() => {
    setBlogsLength(paginationMeta?.total || workstations?.length || 0);
  }, [paginationMeta?.total, workstations, setBlogsLength]);

  const onNavigateToEdit = (workstation) => {
    if (!workstation?.slug) {
      toast.error("Invalid workstation data");
      return;
    }
    navigate(`/dashboard/workstation/edit/${workstation.slug}`);
  };

  const onNavigateDetails = (workstation) => {
    if (!workstation?.slug) {
      toast.error("Invalid workstation data");
      return;
    }
    navigate(`/dashboard/workstation/${workstation.slug}`);
  };

  const handleRowClick = (row) => {
    onNavigateToEdit(row);
  };

  // Adjust columns to match API fields
  const columns = [
    {
      key: "file_no",
      label: "File No",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p">{value || "-"}</Typography>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value) => (
        <Typography className="block line-clamp-2 text-wrap" variant="p">
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "conflict_search",
      label: "Conflict Search",
      render: (value) => (
        <Typography variant="p">
          {value ? format(new Date(value), "dd/MM/yyyy") : "-"}
        </Typography>
      ),
    },
    {
      key: "intake_date",
      label: "Intake Date",
      render: (value) => (
        <Typography variant="p">
          {value ? format(new Date(value), "dd/MM/yyyy") : "-"}
        </Typography>
      ),
    },
    {
      key: "dob",
      label: "Date of Birth",
      render: (value) => (
        <Typography variant="p">
          {value ? format(new Date(value), "dd/MM/yyyy") : "-"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    // Uncomment and use if using an action menu
    // {
    //   key: "actions",
    //   label: "Actions",
    //   render: (value, row) => (
    //     <ActionMenu
    //       options={[
    //         {
    //           label: "Edit",
    //           icon: Pencil,
    //           action: () => onNavigateToEdit(row),
    //         },
    //         {
    //           label: "Delete",
    //           icon: Trash2,
    //           action: () => onOpenDialog(row),
    //           className: "text-red-500",
    //         },
    //       ]}
    //     />
    //   ),
    // },
  ];

  return (
    <>
      <CustomTable
        columns={columns}
        data={workstations}
        isLoading={isLoading}
        error={error}
        onRowClick={handleRowClick}
        totalPages={paginationMeta.last_page || 1}
        currentPage={params.page || 1}
        perPage={params.per_page || 25}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={selectedWorkstation?.file_no}
        modalType="Delete"
        // onDelete={onDeleteClick}
        id={selectedWorkstation?.id}
        isLoading={isDeleting}
      />
    </>
  );
};

export default MatterTable;
