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
import { fetchLatList } from "../helpers/fetchLatList";
import { deleteSectionList } from "../helpers/deleteSectionList";
const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const Section33Table = ({ slug, setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sectionList", slug],
    queryFn: () => fetchLatList(slug),
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
    mutationFn: (id) => deleteSectionList(id),
    onSuccess: () => {
      toast.success("Section deleted successfully.");
      queryClient.invalidateQueries(["sectionList", slug]);
      onCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete section.");
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
    navigate(`/dashboard/section/${section.id}`);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "type_of_plan",
      label: "Type of Plan",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "plan_status",
      label: "Plan Status",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "received_letter_date",
      label: "Letter Received",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    {
      key: "total_amount",
      label: "Total Amount",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "approved_amount",
      label: "Approved Amount",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "partially_approved",
      label: "Partially Approved Count",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "denied_amount",
      label: "Denied Amount",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    // {
    //   key: "response_to_insurance",
    //   label: "Response to Insurance",
    //   render: (value) => safeFormat(value, "dd/MM/yyyy"),
    // },
    // {
    //   key: "section33_request_status",
    //   label: "Section 33 Status",
    //   render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    // },
    // {
    //   key: "note",
    //   label: "Note",
    //   render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    // },
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

export default Section33Table;
