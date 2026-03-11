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
import { fetchImportList } from "../helpers/fetchImportList";
import { copyImportedData } from "../helpers/copyImportedData";
import { printOcfProd2 } from "../helpers/printOcfProd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Import, Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const OcfProdTable = ({ slug, setBlogsLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiSectionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ocfProd2List", slug, params],
    queryFn: () => fetchOcfProd2List(slug, params),
    enabled: !!slug,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const [openImport, setOpenImport] = useState(false);
  const [importList, setImportList] = useState([]);
  const [isFetchingImport, setIsFetchingImport] = useState(false);
  const [selectedImport, setSelectedImport] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const onOpenImportDialog = async () => {
    setOpenImport(true);
    setIsFetchingImport(true);
    try {
      const data = await fetchImportList(slug);
      setImportList(data?.response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch import list");
    } finally {
      setIsFetchingImport(false);
    }
  };

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

  const { mutate: copyMutation, isLoading: isCopying } = useMutation({
    mutationFn: (id) => copyImportedData(id, slug),
    onSuccess: () => {
      toast.success("Data imported successfully.");
      queryClient.invalidateQueries(["ocfProd2List", slug]);
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

  const onImport = () => {
    if (selectedImport) {
      copyMutation(selectedImport);
    } else {
      toast.error("Please select a file to import");
    }
  };

  const sections = Array.isArray(apiSectionResponse?.response?.data)
    ? apiSectionResponse.response.data
    : [];

  useEffect(() => {
    setBlogsLength(sections.length);
  }, [sections, setBlogsLength]);

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
    navigate(`/dashboard/ocf2-prod/edit/${section.id}`);
  };

  const columns = [
    {
      key: "s_no",
      label: "S.No.",
      render: (value, row, index) => (
        <Typography variant="p">
          {(currentPage - 1) * perPage + index + 1}
        </Typography>
      ),
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
      <Dialog open={openImport} onOpenChange={setOpenImport}>
        <DialogContent className="sm:max-w-[800px] min-h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Ocf Data</DialogTitle>
            <DialogDescription>
              Select a file to import data from.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 flex-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="import-select">Select File</Label>
              <Popover open={openDropdown} onOpenChange={setOpenDropdown} modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDropdown}
                    className="w-full justify-between"
                    disabled={isFetchingImport}
                  >
                    {selectedImport
                      ? importList.find(
                        (item) => item.id.toString() === selectedImport
                      )?.name
                      : "Select a file..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[750px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search file..." />
                    <CommandList
                      className="max-h-[225px] overflow-y-auto overflow-x-hidden"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <CommandEmpty>No file found.</CommandEmpty>
                      <CommandGroup>
                        {importList.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id.toString()}
                            onSelect={(currentValue) => {
                              setSelectedImport(
                                currentValue === selectedImport
                                  ? ""
                                  : currentValue
                              );
                              setOpenDropdown(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedImport === item.id.toString()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="mt-auto">
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
              onClick={onImport}
              disabled={isCopying || !selectedImport}
              className="gap-2"
            >
              {isCopying && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCopying ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OcfProdTable;
