import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2, Eye } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { fetchUserList } from "../helpers/fetchUserList";
import { deleteUser } from "../helpers/deleteUser";
import ViewUserDialog from "./ViewUserDialog";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const UserTable = ({ setUsersLength, params }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiUserResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userList", params?.search],
    queryFn: fetchUserList,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [viewUserId, setViewUserId] = useState(null);

  const onOpenDialog = (row) => {
    setOpenDelete(true);
    setSelectedUser(row);
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedUser(null);
  };

  const { mutate: deleteUserMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "User deleted successfully.");
      queryClient.invalidateQueries(["userList"]);
      onCloseDialog();
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to delete user.");
      }
    },
  });

  const onDelete = () => {
    if (selectedUser?.id) {
      deleteUserMutation(selectedUser.id);
    }
  };

  const users = Array.isArray(apiUserResponse?.response?.data)
    ? apiUserResponse.response.data
    : Array.isArray(apiUserResponse?.response)
      ? apiUserResponse.response
      : [];

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!params?.search) return true;
    const searchLower = params.search.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone_number?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.id?.toString().includes(searchLower)
    );
  });

  useEffect(() => {
    setUsersLength(filteredUsers.length);
  }, [filteredUsers, setUsersLength]);

  const onNavigateToEdit = (user) => {
    if (!user?.id) {
      toast.error("Invalid user data");
      return;
    }
    navigate(`/dashboard/setup/user/edit/${user.id}`);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "first_name",
      label: "Name",
      render: (value, row) => (
        <Typography variant="p">
          {`${row.first_name || ""} ${row.last_name || ""}`.trim() || "-"}
        </Typography>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "role",
      label: "Role",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "phone_number",
      label: "Phone",
      render: (value) => <Typography variant="p">{value || "-"}</Typography>,
    },
    {
      key: "is_active",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${value === true || value === 1
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {value === true || value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (value) => safeFormat(value, "dd/MM/yyyy"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => {
        const options = [
          {
            label: "View",
            icon: Eye,
            action: () => {
              setViewUserId(row.id);
              setOpenView(true);
            },
          },
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
        ];

        return <ActionMenu options={options} />;
      },
    },
  ];

  return (
    <>
      <CustomTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        error={error}
        onRowClick={onNavigateToEdit}
      />
      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={
          `${selectedUser?.first_name || ""} ${selectedUser?.last_name || ""
            }`.trim() || "this user"
        }
        modalType="Delete"
        onDelete={onDelete}
        id={selectedUser?.id}
        isLoading={isDeleting}
      />
      <ViewUserDialog
        open={openView}
        onClose={() => setOpenView(false)}
        userId={viewUserId}
      />
    </>
  );
};

export default UserTable;
