import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import ActionMenu from "@/components/action_menu";
import { CustomDialog } from "@/components/custom_dialog";
import { Badge } from "@/components/ui/badge";

import { fetchTaskList } from "../helpers/fetchTaskList";
import { deleteTask } from "../helpers/deleteTask";
import { getABMeta } from "../helpers/fetchABMeta";
import { updateStatus } from "../helpers/createTask";

const TaskTable = ({ setTasksLength }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: apiTaskResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["taskList"],
    queryFn: fetchTaskList,
  });
  const { data: metaData, isLoading: isMetaLoading } = useQuery({
    queryKey: ["taskMeta"],
    queryFn: getABMeta,
  });

  const tasks = Array.isArray(apiTaskResponse?.response?.tasks)
    ? apiTaskResponse.response.tasks
    : [];

  const taskStatuses = Array.isArray(metaData?.response?.taks_status)
    ? metaData.response.taks_status
    : [];

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

  const { mutate: deleteTaskMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => {
      toast.success("Task deleted successfully.");
      queryClient.invalidateQueries(["taskList"]);
      onCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete task.");
    },
  });

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: ({ id, status_id }) => updateStatus(id, { status_id }),
    onSuccess: () => {
      toast.success("Status updated successfully.");
      queryClient.invalidateQueries(["taskList"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update status.");
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
      key: "file_no",
      label: "File No",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "applicantInformations_name",
      label: "Applicant Name",
      render: (value) => (
        <Typography className="block line-clamp-2 text-wrap" variant="p">
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "firm_name",
      label: "Firm",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => {
        const getVariant = (priority) => {
          switch (priority) {
            case "High":
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
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
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
    {
      key: "due_status",
      label: "Due Status",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
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
          className="p-1 text-gray-500"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
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
        data={tasks}
        isLoading={isLoading}
        error={error}
        // onRowClick={handleRowClick}
      />
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
