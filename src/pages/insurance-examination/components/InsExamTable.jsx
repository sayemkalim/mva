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
import { deleteInsExam } from "../helpers/deleteInsExam";
import { fetchInsExamList } from "../helpers/fetchInsExamList";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const safeFormatTime = (timeStr) => {
  if (!timeStr) return "-";
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
};

const InsExamTable = ({ slug, setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["insexamlist", slug],
    queryFn: () => fetchInsExamList(slug),
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
    mutationFn: (id) => deleteInsExam(id),
    onSuccess: () => {
      toast.success("InsuranceExam deleted successfully.");
      queryClient.invalidateQueries(["insexamlist", slug]);
      onCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete InsuranceExam.");
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
    console.log("Row data:", section); // पहले यह check करें
    console.log("Section ID:", section?.id);

    if (!section?.id) {
      toast.error("Invalid section data");
      return;
    }
    navigate(`/dashboard/insurance-examnation/edit/${section.id}`);
  };

  const columns = [
    {
      key: "type_of_assessment",
      label: "Type of Assessment",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "ie_received_in_our_office",
      label: "IE Received",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "informed_client",
      label: "Client Informed",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Yes"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "assessor_name",
      label: "Assessor Name",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "time",
      label: "Time",
      render: (value) => (
        <Typography variant="p">{safeFormatTime(value)}</Typography>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (value) => (
        <Typography variant="p" className="max-w-xs truncate">
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "interpreter",
      label: "Interpreter",
      render: (value) => (
        <Typography variant="p" className="text-sm">
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "transportation",
      label: "Transportation",
      render: (value) => (
        <Typography variant="p" className="text-sm">
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "reminder_to_client",
      label: "Reminder",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
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

export default InsExamTable;
