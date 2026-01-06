import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Eye, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionMenu from "@/components/action_menu";
import { CustomDialog } from "@/components/custom_dialog";
import { Badge } from "@/components/ui/badge";
import Typography from "@/components/typography";
import { toast } from "sonner";
import { deleteRole } from "../helpers";

const RolesTable = ({ roles, isLoading, onEdit }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const onOpenDialog = (role) => {
    setOpenDelete(true);
    setSelectedRole(role);
  };

  const onCloseDialog = () => {
    setOpenDelete(false);
    setSelectedRole(null);
  };

  const { mutate: deleteRoleMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted successfully.");
      queryClient.invalidateQueries(["rolesList"]);
      onCloseDialog();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete role.");
    },
  });

  const onDelete = () => {
    if (selectedRole?.id) {
      deleteRoleMutation(selectedRole.id);
    }
  };

  const handleViewRole = (roleId) => {
    navigate(`/dashboard/setup/roles/${roleId}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-16 w-16 text-gray-300 mb-4" />
        <Typography variant="h3" className="text-gray-500 mb-2">
          No Roles Found
        </Typography>
        <Typography variant="p" className="text-gray-400">
          Get started by creating your first role
        </Typography>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="relative hover:shadow-lg transition-shadow duration-200 border-2 cursor-pointer"
            onClick={() => handleViewRole(role.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {role.name}
                    </CardTitle>
                    <Typography variant="small" className="text-gray-500">
                      Role ID: {role.id}
                    </Typography>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    options={[
                      {
                        label: "View",
                        icon: Eye,
                        action: () => handleViewRole(role.id),
                      },
                      {
                        label: "Edit",
                        icon: Pencil,
                        action: () => onEdit(role),
                      },
                      {
                        label: "Delete",
                        icon: Trash2,
                        action: () => onOpenDialog(role),
                        className: "text-red-500",
                      },
                    ]}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {role.permissions_count !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {role.permissions_count} Permission{role.permissions_count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomDialog
        onOpen={openDelete}
        onClose={onCloseDialog}
        title={selectedRole?.name || "this role"}
        modalType="Delete"
        onDelete={onDelete}
        id={selectedRole?.id}
        isLoading={isDeleting}
      />
    </>
  );
};

export default RolesTable;
