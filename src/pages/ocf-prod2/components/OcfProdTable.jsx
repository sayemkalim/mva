import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Printer, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { fetchOcfProd2List } from "../helpers/fetchOcfProd2List";
import { deleteOcfProd2List } from "../helpers/deleteOcfProd2List";
import { printOcfProd2 } from "../helpers/printOcfProd";
import { Button } from "@/components/ui/button";

const OcfProdTable = ({ slug, setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ocfProd2List", slug],
    queryFn: () => fetchOcfProd2List(slug),
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
    mutationFn: (id) => deleteOcfProd2List(id),
    onSuccess: () => {
      toast.success("ocfProdList deleted successfully.");
      queryClient.invalidateQueries(["ocfProd2List", slug]);
      onCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete section.");
    },
  });

  const { mutate: printMutation, isLoading: isPrinting } = useMutation({
    mutationFn: (id) => printOcfProd2(id),
    onSuccess: () => {
      toast.success("Document downloaded successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to download document.");
    },
  });

  const onDelete = () => {
    if (selectedSection?.id) {
      deleteSectionMutation(selectedSection.id);
    }
  };

  const onPrint = (e, row) => {
    e.stopPropagation(); // Prevent row click event
    if (!row?.id) {
      toast.error("Invalid document");
      return;
    }
    printMutation(row.id);
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
    navigate(`/dashboard/ocf2-prod/edit/${section.id}`);
  };

  const columns = [
    {
      key: "id",
      label: "OCF Production ID",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "name",
      label: "Name",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "created_at",
      label: "Created At",
      render: (value) => {
        const dateObj = value ? new Date(value) : null;
        return dateObj && isValid(dateObj)
          ? format(dateObj, "dd/MM/yyyy HH:mm")
          : "-";
      },
    },
    {
      key: "print",
      label: "Print",
      render: (value, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => onPrint(e, row)}
          disabled={isPrinting}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
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

export default OcfProdTable;
