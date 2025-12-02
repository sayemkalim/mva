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
import { fetchVsrInsExamList } from "../helpers/fetchInsExamList";
import { deleteVsrInsuranceExamination } from "../helpers/deleteInsExam";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const safeFormatTime = (timeStr) => {
  if (!timeStr) return "-";
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
};

const VsrInsExamTable = ({ slug, setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vsrinsexamlist", slug],
    queryFn: () => fetchVsrInsExamList(slug),
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
    mutationFn: (id) => deleteVsrInsuranceExamination(id),
    onSuccess: () => {
      toast.success("VsrInsuranceExam deleted successfully.");
      queryClient.invalidateQueries(["vsrinsexamlist", slug]);
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
      key: "referral_partner",
      label: "Referral Partner",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "request_for_assessment",
      label: "Request for Assessment",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "follow_up_1st",
      label: "1st Follow-up",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "follow_up_2nd",
      label: "2nd Follow-up",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "assessment_rescheduled",
      label: "Rescheduled",
      render: (value) => (
        <Typography variant="p" className="text-center">
          {value ?? "-"}
        </Typography>
      ),
    },
    {
      key: "date_of_assessment",
      label: "Assessment Date",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
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
      key: "assessor_name",
      label: "Assessor Name",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "interprator",
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
      key: "informed_to_client",
      label: "Client Informed",
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
      key: "date_of_report_received",
      label: "Report Received",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "report_reviewed_date",
      label: "Reviewed Date",
      render: (value) => (
        <Typography variant="p">{safeFormat(value, "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "report_reviewed_by",
      label: "Reviewed By",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "report_fax_or_email_to_insurance",
      label: "Report to Insurance",
      render: (value) => (
        <Typography variant="p" className="max-w-xs truncate">
          {value || "-"}
        </Typography>
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

export default VsrInsExamTable;
