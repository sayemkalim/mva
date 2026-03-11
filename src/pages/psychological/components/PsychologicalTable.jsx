import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Import, Pencil, Printer, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deletePsychologicalList } from "../helpers/deletePsychologicalList";
import { fetchPsychologicalList } from "../helpers/fetchPsychological";
import { printPsychological } from "../helpers/printPsychological";
import { fetchImportList } from "../helpers/fetchImportList";
import { copyImportedData } from "../helpers/copyImportedData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const PsychologicalTable = ({ slug, setBlogsLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["List", slug],
    queryFn: () => fetchPsychologicalList(slug),
    enabled: !!slug,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const onOpenDialog = (row) => {
    setOpenDelete(true);
    setSelectedSection(row);
  };

  const [openImport, setOpenImport] = useState(false);
  const [importList, setImportList] = useState([]);
  const [isFetchingImport, setIsFetchingImport] = useState(false);
  const [selectedImport, setSelectedImport] = useState("");

  const onOpenImportDialog = async () => {
    setOpenImport(true);
    setIsFetchingImport(true);
    try {
      const data = await fetchImportList(slug);
      console.log("Fetched Import Data:", data); // Added log for debugging
      setImportList(data?.response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch import list");
    } finally {
      setIsFetchingImport(false);
    }
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedSection(null);
  };

  const { mutate: deleteSectionMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (id) => deletePsychologicalList(id),
    onSuccess: () => {
      toast.success("ProdList deleted successfully.");
      queryClient.invalidateQueries(["List", slug]);
      onCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete section.");
    },
  });
  const { mutate: printMutation, isLoading: isPrinting } = useMutation({
    mutationFn: (id) => printPsychological(id),
    onSuccess: () => {
      toast.success("Document downloaded successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to download document.");
    },
  });

  const { mutate: copyMutation, isLoading: isCopying } = useMutation({
    mutationFn: (id) => copyImportedData(id, slug),
    onSuccess: () => {
      toast.success("Data imported successfully.");
      queryClient.invalidateQueries(["List", slug]);
      setOpenImport(false);
      setSelectedImport("");
    },
    onError: (error) => {
      toast.error(error?.response?.message || "Failed to import data.");
    },
  });

  const onDelete = () => {
    if (selectedSection?.id) {
      deleteSectionMutation(selectedSection.id);
    }
  };

  const onPrint = (e, row) => {
    e.stopPropagation();
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
    navigate(`/dashboard/psychological/edit/${section.id}`);
  };

  const columns = [
    {
      key: "id",
      label: "Psychological ID",
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
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className="gap-2"
          onClick={onOpenImportDialog}
        >
          <Import className="h-4 w-4" />
          Import
        </Button>
      </div>
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

      <Dialog open={openImport} onOpenChange={setOpenImport}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Psychological Data</DialogTitle>
            <DialogDescription>
              Select a file to import data from.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="import-select">Select File</Label>
              <Select
                onValueChange={setSelectedImport}
                value={selectedImport}
                disabled={isFetchingImport}
              >
                <SelectTrigger id="import-select">
                  <SelectValue
                    placeholder={
                      isFetchingImport ? "Loading..." : "Select a file"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {importList.length > 0 ? (
                    importList.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {isFetchingImport ? "Fetching data..." : "No data available"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenImport(false);
                setSelectedImport("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedImport || isFetchingImport || isCopying}
              onClick={() => {
                if (selectedImport) {
                  copyMutation(selectedImport);
                }
              }}
            >
              {(isFetchingImport || isCopying) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PsychologicalTable;
