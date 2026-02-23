import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
  Eye,
  MessageSquare,
  Pencil,
  Trash2,
  Filter,
  CalendarIcon,
  X,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import ActionMenu from "@/components/action_menu";
import { CustomDialog } from "@/components/custom_dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { fetchTaskList } from "../helpers/fetchTaskList";
import { deleteTask } from "../helpers/deleteTask";
import { getABMeta } from "../helpers/fetchABMeta";
import { updateStatus, searchContact } from "../helpers/createTask";

const TaskTable = ({ setTasksLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openDelete, setOpenDelete] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filters, setFilters] = useState({
    applicant_name: "",
    priority_id: "",
    status_id: "",
    assigned_to: "",
    from_date: null,
    to_date: null,
  });
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const debouncedClientSearch = useDebounce(clientSearchQuery, 500);

  // Build query params for API
  const buildQueryParams = (filterObj) => {
    const params = new URLSearchParams();

    if (filterObj.applicant_name)
      params.append("applicant_name", filterObj.applicant_name);
    if (filterObj.priority_id)
      params.append("priority_id", filterObj.priority_id);
    if (filterObj.status_id) params.append("status_id", filterObj.status_id);
    if (filterObj.assigned_to)
      params.append("assigned_to", filterObj.assigned_to);
    if (filterObj.from_date) {
      params.append(
        "from_date",
        format(new Date(filterObj.from_date), "yyyy-MM-dd")
      );
    }
    if (filterObj.to_date) {
      params.append(
        "to_date",
        format(new Date(filterObj.to_date), "yyyy-MM-dd")
      );
    }

    return params.toString();
  };

  const {
    data: apiTaskResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["taskList", filters],
    queryFn: () => {
      const queryString = buildQueryParams(filters);
      return fetchTaskList(queryString);
    },
  });

  const { data: metaData, isLoading: isMetaLoading } = useQuery({
    queryKey: ["taskMeta"],
    queryFn: getABMeta,
  });

  const tasks = Array.isArray(apiTaskResponse?.response?.tasks)
    ? apiTaskResponse.response.tasks
    : [];

  const taskStatuses = useMemo(() => {
    return Array.isArray(metaData?.response?.taks_status)
      ? metaData.response.taks_status
      : [];
  }, [metaData]);

  const taskPriorities = useMemo(() => {
    return Array.isArray(metaData?.response?.taks_priority)
      ? metaData.response.taks_priority
      : [];
  }, [metaData]);

  const assigneesList = useMemo(() => {
    return Array.isArray(metaData?.response?.assignees)
      ? metaData.response.assignees
      : [];
  }, [metaData]);

  const {
    data: contactsResponse,
    isLoading: isSearchingContacts,
  } = useQuery({
    queryKey: ["searchContacts", debouncedClientSearch],
    queryFn: () => searchContact({ searchBar: debouncedClientSearch }),
    enabled: debouncedClientSearch.length > 0,
  });

  const searchedContacts = contactsResponse?.response?.data || [];

  useEffect(() => {
    setTasksLength?.(tasks.length || 0);
  }, [tasks, setTasksLength]);

  const onOpenDialog = (row) => {
    if (!row?.id) return;
    setSelectedTask(row);
    setOpenDelete(true);
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedTask(null);
  };

  const handleClearFilters = () => {
    setFilters({
      applicant_name: "",
      priority_id: "",
      status_id: "",
      assigned_to: "",
      from_date: null,
      to_date: null,
    });
    setClientSearchQuery("");
  };

  const handleApplyFilters = () => {
    setOpenFilter(false);
    toast.success("Filters applied successfully");
  };

  const hasActiveFilters = Object.values(filters).some((value) =>
    value !== null && value !== "" ? true : false
  );

  const { mutate: deleteTaskMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Task deleted successfully.");
      queryClient.invalidateQueries(["taskList"]);
      onCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to delete task.");
      }
    },
  });

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: ({ id, status_id }) => updateStatus(id, { status_id }),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Status updated successfully.");
      queryClient.invalidateQueries(["taskList"]);
    },
    onError: (error) => {
      console.error(error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to update status.");
      }
    },
  });

  const handleStatusChange = (taskId, newStatusId) => {
    updateStatusMutation({ id: taskId, status_id: newStatusId });
  };

  const onNavigateToEdit = (task) => {
    if (!task?.id) {
      toast.error("Invalid task data");
      return;
    }
    navigate(`/dashboard/tasks/edit/${task.id}`);
  };

  const onNavigateDetails = (task) => {
    if (!task?.slug) {
      toast.error("Invalid task data");
      return;
    }
    navigate(`/dashboard/tasks/${task.id}`);
  };

  const handleRowClick = (row) => {
    onNavigateDetails(row);
  };

  const columns = [
    {
      key: "subject",
      label: "Subject",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },


    {
      key: "priority",
      label: "Priority",
      render: (value) => {
        const getVariant = (priority) => {
          switch (priority) {
            case "High":
            case "Urgent":
              return "destructive";
            case "Medium":
              return "default";
            case "Low":
              return "secondary";
            default:
              return "outline";
          }
        };

        return <Badge variant={getVariant(value)}>{value || "-"}</Badge>;
      },
    },
    {
      key: "status_id",
      label: "Status",
      render: (value, row) => {
        if (isMetaLoading) {
          return <Typography variant="p">Loading...</Typography>;
        }

        return (
          <select
            value={value || ""}
            onChange={(e) => {
              e.stopPropagation();
              handleStatusChange(row.id, Number(e.target.value));
            }}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card min-w-[150px]"
          >
            <option value="">Select Status</option>
            {taskStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        );
      },
    },
    // {
    //   key: "due_status",
    //   label: "Due Status",
    //   render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    // },
    {
      key: "due_date",
      label: "Due Date",
      render: (value) => (
        <Typography variant="p">
          {value ? format(new Date(value), "dd/MM/yyyy") : "-"}
        </Typography>
      ),
    },
    {
      key: "assignees",
      label: "Assignees",
      render: (value) => (
        <div className="flex -space-x-2">
          {Array.isArray(value) && value.length > 0 ? (
            value.slice(0, 3).map((assignee, index) => (
              <div
                key={index}
                className="h-8 w-8 rounded-full border-2 border-white overflow-hidden"
                title={assignee?.name}
              >
                <img
                  src={assignee?.profile}
                  alt={assignee?.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))
          ) : (
            <Typography variant="p">-</Typography>
          )}
        </div>
      ),
    },
    {
      key: "assigned_by",
      label: "Assigned By",
      render: (value) => {
        if (!value) {
          return <Typography variant="p">-</Typography>;
        }

        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-gray-200 overflow-hidden flex-shrink-0">
              <img
                src={value?.profile}
                alt={value?.name}
                className="h-full w-full object-cover"
              />
            </div>
            <Typography variant="p" className="text-sm">
              {/* {value?.name} */}
            </Typography>
          </div>
        );
      },
    },
    {
      key: "created_at",
      label: "Created At",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "comments",
      label: "Comments",
      render: (value, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/tasks/comments/${row.id}`);
          }}
          className="relative p-1 text-gray-500 hover:text-foreground transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {row.unread_comments_count > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full">
              {row.unread_comments_count > 99
                ? "99+"
                : row.unread_comments_count}
            </span>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => {
        const options = [
          {
            label: "Edit",
            icon: Pencil,
            action: () => onNavigateToEdit(row),
            disabled: !row.is_editable,
          },
          {
            label: "Delete",
            icon: Trash2,
            action: () => onOpenDialog(row),
            className: "text-red-500",
            disabled: !row.is_deletable,
          },
        ];

        return <ActionMenu options={options} />;
      },
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between ">
        <Button
          onClick={() => setOpenFilter(true)}
          variant="outline"
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1 h-5 px-1.5">
              Active
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button onClick={handleClearFilters} variant="ghost" size="sm">
            Clear All Filters
          </Button>
        )}
      </div>

      <CustomTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        error={error}
      // onRowClick={handleRowClick}
      />

      <Dialog open={openFilter} onOpenChange={setOpenFilter}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              Filter Tasks
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 items-start">
              {/* Client */}
              <div className="grid gap-3">
                <Label htmlFor="client" className="text-base font-medium">
                  Client
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-12 bg-muted w-full justify-between font-normal"
                    >
                      {filters.applicant_name ? (
                        filters.applicant_name
                      ) : (
                        <span className="text-muted-foreground">Search client...</span>
                      )}
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type to search clients..."
                        value={clientSearchQuery}
                        onValueChange={setClientSearchQuery}
                      />
                      <CommandList>
                        {isSearchingContacts && (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Searching...</span>
                          </div>
                        )}
                        {!isSearchingContacts && debouncedClientSearch && searchedContacts.length === 0 && (
                          <CommandEmpty>No clients found.</CommandEmpty>
                        )}
                        {!isSearchingContacts && !debouncedClientSearch && (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Start typing to search clients
                          </div>
                        )}

                        <CommandGroup>
                          {searchedContacts.length > 0 && searchedContacts.map((contact) => (
                            <CommandItem
                              key={contact.id}
                              value={contact.contact_name}
                              onSelect={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  applicant_name: contact.contact_name,
                                }));
                                setClientSearchQuery(contact.contact_name);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.applicant_name === contact.contact_name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{contact.contact_name}</span>
                                <span className="text-[10px] text-muted-foreground">{contact.primary_email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Priority */}
              <div className="grid gap-3">
                <Label htmlFor="priority" className="text-base font-medium">
                  Priority
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-12 bg-muted w-full justify-between font-normal"
                    >
                      {filters.priority_id ? (
                        taskPriorities.find(p => String(p.id) === String(filters.priority_id))?.name
                      ) : (
                        <span className="text-muted-foreground">All priorities</span>
                      )}
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search priority..." />
                      <CommandList>
                        <CommandEmpty>No priorities found.</CommandEmpty>
                        <CommandGroup>
                          {taskPriorities.map((priority) => (
                            <CommandItem
                              key={priority.id}
                              value={priority.name}
                              onSelect={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  priority_id: String(priority.id),
                                }));
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(filters.priority_id) === String(priority.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {priority.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status */}
              <div className="grid gap-3">
                <Label htmlFor="status" className="text-base font-medium">
                  Status
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-12 bg-muted w-full justify-between font-normal"
                    >
                      {filters.status_id ? (
                        taskStatuses.find(s => String(s.id) === String(filters.status_id))?.name
                      ) : (
                        <span className="text-muted-foreground">All statuses</span>
                      )}
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search status..." />
                      <CommandList>
                        <CommandEmpty>No statuses found.</CommandEmpty>
                        <CommandGroup>
                          {taskStatuses.map((status) => (
                            <CommandItem
                              key={status.id}
                              value={status.name}
                              onSelect={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  status_id: String(status.id),
                                }));
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(filters.status_id) === String(status.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {status.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Assignee */}
              <div className="grid gap-3">
                <Label htmlFor="assignee" className="text-base font-medium">
                  Assignee
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-12 bg-muted w-full justify-between font-normal"
                    >
                      {filters.assigned_to ? (
                        assigneesList.find(a => String(a.id) === String(filters.assigned_to))?.name
                      ) : (
                        <span className="text-muted-foreground">All assignees</span>
                      )}
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search assignee..." />
                      <CommandList>
                        <CommandEmpty>No assignees found.</CommandEmpty>
                        <CommandGroup>
                          {assigneesList.map((assignee) => (
                            <CommandItem
                              key={assignee.id}
                              value={assignee.name}
                              onSelect={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  assigned_to: String(assignee.id),
                                }));
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(filters.assigned_to) === String(assignee.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full overflow-hidden border">
                                  <img src={assignee.profile} alt="" className="h-full w-full object-cover" />
                                </div>
                                <span>{assignee.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* From Date */}
              <div className="grid gap-3">
                <Label htmlFor="from_date" className="text-base font-medium">
                  From Date
                </Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left font-normal bg-muted",
                        !filters.from_date && "text-muted-foreground"
                      )}
                    >
                      {filters.from_date ? (
                        format(filters.from_date, "dd/MM/yyyy")
                      ) : (
                        <span>dd/mm/yyyy</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 pointer-events-auto"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={filters.from_date}
                      onSelect={(date) => {
                        setFilters((prev) => ({ ...prev, from_date: date }));
                      }}
                      defaultMonth={filters.from_date || undefined}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="grid gap-3">
                <Label htmlFor="to_date" className="text-base font-medium">
                  To Date
                </Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h- w-full justify-start text-left font-normal bg-muted",
                        !filters.to_date && "text-muted-foreground"
                      )}
                    >
                      {filters.to_date ? (
                        format(filters.to_date, "dd/MM/yyyy")
                      ) : (
                        <span>dd/mm/yyyy</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 pointer-events-auto"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={filters.to_date}
                      onSelect={(date) => {
                        setFilters((prev) => ({ ...prev, to_date: date }));
                      }}
                      defaultMonth={filters.to_date || undefined}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="px-8 h-11 text-base"
            >
              Clear all filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="px-8 h-11 text-base bg-indigo-600 hover:bg-indigo-700"
            >
              Apply filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={selectedTask?.file_no}
        modalType="Delete"
        id={selectedTask?.id}
        isLoading={isDeleting}
        onDelete={() => deleteTaskMutation(selectedTask?.id)}
      />
    </>
  );
};

export default TaskTable;
