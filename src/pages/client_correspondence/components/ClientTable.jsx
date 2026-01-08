import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, isValid } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { fetchClientCorrespondanceList } from "../helpers/fetchClientList";
import { deleteClientCorrespondence } from "../helpers/deleteClient";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const ClientTable = ({ slug, setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clientcorrespondencelist", slug],
    queryFn: () => fetchClientCorrespondanceList(slug),
    enabled: !!slug,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const onOpenDialog = (row) => {
    setOpenDelete(true);
    setSelectedSection(row);
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedSection(null);
  };

  const { mutate: deleteSectionMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (id) => deleteClientCorrespondence(id),
    onSuccess: () => {
      toast.success("Client deleted successfully.");
      queryClient.invalidateQueries(["clientcorrespondencelist", slug]);
      onCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete Client.");
    },
  });

  const onDelete = () => {
    if (selectedSection?.id) {
      deleteSectionMutation(selectedSection.id);
    }
  };

  const sections = Array.isArray(apiSectionResponse?.response?.data)
    ? apiSectionResponse.response.data
    : [];

  useEffect(() => {
    setBlogsLength(sections.length);
  }, [sections, setBlogsLength]);

  const onNavigateToEdit = (section) => {
    if (!section?.id) {
      toast.error("Invalid section data");
      return;
    }
    navigate(`/dashboard/client-correspondence/edit/${section.id}`);
  };

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <Typography variant="p" className="max-w-xs truncate">
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "action_performed_by",
      label: "Performed By",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "time",
      label: "Time (min)",
      render: (value) => (
        <Typography variant="p">{value ? `${value} min` : "-"}</Typography>
      ),
    },
    {
      key: "rate",
      label: "Rate",
      render: (value) => (
        <Typography variant="p">
          {value ? `$${parseFloat(value).toFixed(2)}` : "-"}
        </Typography>
      ),
    },
    {
      key: "value",
      label: "Value",
      render: (value) => (
        <Typography variant="p" className="font-semibold">
          {value ? `$${parseFloat(value).toFixed(2)}` : "-"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const statusColors = {
          Billable:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          "Non-Billable":
            "bg-gray-100 text-foreground dark:bg-gray-800 dark:text-gray-300",
          Pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[value] || "bg-gray-100 text-foreground"
            }`}
          >
            {value || "-"}
          </span>
        );
      },
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
              action: () => onNavigateToEdit(row),
            },
            {
              label: "Delete",
              icon: Trash2,
              action: () => onOpenDialog(row),
              className: "text-red-500",
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
        data={sections}
        isLoading={isLoading}
        error={error}
        onRowClick={onNavigateToEdit}
      />
      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={selectedSection?.slug}
        modalType="Delete"
        onDelete={onDelete}
        id={selectedSection?.id}
        isLoading={isDeleting}
      />
    </>
  );
};

export default ClientTable;
