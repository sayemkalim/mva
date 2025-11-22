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

const MatterTable = ({ setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiWorkstationResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workstationList"],
    queryFn: fetchWorkstationList,
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

  const onDeleteClick = (id) => {
    deleteWorkstationMutation(id);
  };

  const workstations = Array.isArray(apiWorkstationResponse?.response)
    ? apiWorkstationResponse.response
    : [];

  // console.log("API Response:", apiWorkstationResponse);
  // console.log("Workstations:", workstations);
  // console.log("Is Loading:", isLoading);
  console.log("Error:", error);

  useEffect(() => {
    setBlogsLength(workstations?.length || 0);
  }, [workstations, setBlogsLength]);

  const onNavigateToEdit = (workstation) => {
    console.log("Full workstation object:", workstation);
    console.log("Slug value:", workstation.slug);
    console.log("Slug type:", typeof workstation.slug);
    console.log(
      "Navigate URL:",
      `/dashboard/workstations/edit/${workstation.slug}`
    );

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

  const columns = [
    {
      key: "file_no",
      label: "File No",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p">{value || "-"}</Typography>
          <Typography variant="span" className="text-gray-500 text-sm">
            {row.file_number || "-"}
          </Typography>
        </div>
      ),
    },
    {
      key: "firm_name",
      label: "Firm Name",
      render: (value, row) => (
        <div className="w-96">
          <Typography className="block line-clamp-2 text-wrap" variant="p">
            {value || "-"}
          </Typography>
          <Typography
            variant="span"
            className="block line-clamp-2 text-gray-500 text-wrap"
          >
            Lawyer: {row.lawyer_name || "-"}
          </Typography>
        </div>
      ),
    },
    {
      key: "paralegal_name",
      label: "Paralegal",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p">{value || "-"}</Typography>
          {row.assigned_to_paralegal && (
            <Typography variant="span" className="text-gray-500 text-sm">
              Assigned: {row.assigned_to_paralegal}
            </Typography>
          )}
        </div>
      ),
    },
    {
      key: "counsel_name",
      label: "Counsel",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "intake_date",
      label: "Intake Date",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p">
            {value ? format(new Date(value), "dd/MM/yyyy") : "-"}
          </Typography>
          {row.assigned_date && (
            <Typography variant="span" className="text-gray-500 text-sm">
              Assigned: {format(new Date(row.assigned_date), "dd/MM/yyyy")}
            </Typography>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography>
            {format(new Date(value), "dd/MM/yyyy hh:mm a")}
          </Typography>
          {value !== row.updated_at && (
            <Typography className="text-gray-500 text-sm">
              Updated -{" "}
              {formatDistanceToNow(new Date(row.updated_at), {
                addSuffix: true,
              })}
            </Typography>
          )}
        </div>
      ),
    },
    // {
    //   key: "actions",
    //   label: "Actions",
    //   render: (value, row) => (
    //     <ActionMenu
    //       options={[
    //         // {
    //         //   label: "View Details",
    //         //   icon: Eye,
    //         //   action: () => onNavigateDetails(row),
    //         // },
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
      />
      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={selectedWorkstation?.file_no}
        modalType="Delete"
        onDelete={onDeleteClick}
        id={selectedWorkstation?.id}
        isLoading={isDeleting}
      />
    </>
  );
};

export default MatterTable;
