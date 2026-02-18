import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { fetchConflictList } from "../helpers/fetchConflictList";
import { deleteConflict } from "../helpers/deleteConflict";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const ConflictTable = ({ slug, setBlogsLength, params = {} }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conflictlist", slug, params.search],
    queryFn: () => fetchConflictList(slug, { search: params.search || "" }),
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
    mutationFn: (id) => deleteConflict(id),
    onSuccess: () => {
      toast.success("Section deleted successfully.");
      queryClient.invalidateQueries(["conflictlist", slug]);
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

    navigate(`/dashboard/conflict-search/edit/${section.id}`, {
      state: {
        conflictData: section,
        slug: slug
      }
    });
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "attachment",
      label: "Image",
      render: (value, row) => {
        if (!value?.path) return <Typography variant="p">-</Typography>;

        const imageUrl = value.path.startsWith("http")
          ? value.path
          : `${import.meta.env.VITE_API_URL || "https://mva-backend.vsrlaw.ca/"
          }/${value.path}`;

        return (
          <img
            src={imageUrl}
            alt={value.original_name || "attachment"}
            className="h-12 w-24 object-cover rounded border"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTUgMTVMMjUgMjVNMjUgMTVMMTUgMjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+";
            }}
          />
        );
      },
    },
    {
      key: "memo",
      label: "Memo",
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
        // title={selectedSection?.slug}
        modalType="Delete"
        onDelete={onDelete}
        id={selectedSection?.id}
        isLoading={isDeleting}
      />
    </>
  );
};

export default ConflictTable;
