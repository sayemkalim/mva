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
import { fetchSectionList } from "../helpers/fetchSectionList";
import { deleteSectionList } from "../helpers/deleteSectionList";
const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const Section258Table = ({ slug, setBlogsLength, params = {} }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["section258List", slug, params.search],
    queryFn: () => fetchSectionList(slug, { search: params.search || "" }),
    enabled: !!slug,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

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

  // Pagination calculations
  const totalPages = Math.ceil(sections.length / perPage);
  const paginatedData = sections.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const onNavigateToEdit = (section) => {
    if (!section?.id) {
      toast.error("Invalid section data");
      return;
    }
    navigate(`/dashboard/section258/${section.id}`);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "first_request",
      label: "First Request",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "letter_received_in_office",
      label: "Letter Received",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    // {
    //   key: "documents_requested_by_insurer",
    //   label: "Docs Requested",
    //   render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    // },
    // {
    //   key: "from_date",
    //   label: "From Date",
    //   render: (value) => safeFormat(value, "dd/MM/yyyy"),
    // },
    // {
    //   key: "to_date",
    //   label: "To Date",
    //   render: (value) => safeFormat(value, "dd/MM/yyyy"),
    // },
    {
      key: "request_date",
      label: "Request Date",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    {
      key: "requested_documents",
      label: "Document Details",
      render: (value) => {
        if (!Array.isArray(value) || value.length === 0) return <Typography variant="p">-</Typography>;
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left py-1 px-2 font-medium">Requested Documents</th>
                <th className="text-left py-1 px-2 font-medium">From Date</th>
                <th className="text-left py-1 px-2 font-medium">To Date</th>
                <th className="text-left py-1 px-2 font-medium">First Reminder</th>
                <th className="text-left py-1 px-2 font-medium">Second Reminder</th>
              </tr>
            </thead>
            <tbody>
              {value.map((doc, i) => (
                <tr key={i} className={i < value.length - 1 ? "border-b border-black" : ""}>
                  <td className="py-2 px-2 text-sm">{doc.requested_name || "-"}</td>
                  <td className="py-2 px-2 text-sm">{safeFormat(doc.from_date, "yyyy-MM-dd")}</td>
                  <td className="py-2 px-2 text-sm">{safeFormat(doc.to_date, "yyyy-MM-dd")}</td>
                  <td className="py-2 px-2 text-sm">{safeFormat(doc.first_reminder, "yyyy-MM-dd")}</td>
                  <td className="py-2 px-2 text-sm">{safeFormat(doc.second_reminder, "yyyy-MM-dd")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      },
    },
    // {
    //   key: "first_reminder",
    //   label: "First Reminder",
    //   render: (value) => safeFormat(value, "dd/MM/yyyy"),
    // },
    // {
    //   key: "second_reminder",
    //   label: "Second Reminder",
    //   render: (value) => safeFormat(value, "dd/MM/yyyy"),
    // },
    {
      key: "received_document",
      label: "Received Document",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    {
      key: "response_to_insurance",
      label: "Response to Insurance",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    {
      key: "section33_request_status",
      label: "Section 33 Status",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
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
        data={paginatedData}
        isLoading={isLoading}
        error={error}
        onRowClick={onNavigateToEdit}
        totalPages={totalPages}
        currentPage={currentPage}
        perPage={perPage}
        onPageChange={setCurrentPage}
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

export default Section258Table;
