import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Typography from "@/components/typography";
import { 
  Shield, 
  User, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Pencil, 
  Trash2,
  CheckCircle2 
} from "lucide-react";
import { showRole } from "../helpers";
import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import RoleEditor from "./RoleEditor";
import { CustomDialog } from "@/components/custom_dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRole } from "../helpers";
import { toast } from "sonner";

const RoleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openEditor, setOpenEditor] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["roleDetail", id],
    queryFn: () => showRole(id),
    enabled: !!id,
  });

  const { mutate: deleteRoleMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted successfully.");
      navigate("/dashboard/setup/roles");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete role.");
    },
  });

  const roleData = data?.response?.data || {};
  const permissions = roleData?.permissions || [];

  // Categorization logic
  const sidebarCategories = {
    Dashboard: {
      exact: ["dashboard"],
      prefixes: ["dashboard"],
    },
    "Main Navigation": {
      exact: ["workstation", "task", "event", "emails", "reports"],
      prefixes: ["workstation", "task", "event", "email", "report"],
    },
    "File Information": {
      exact: ["initial"],
      prefixes: ["initial"],
    },
    "Applicant": {
      exact: ["applicant_info", "identification", "employment", "school_or_caregiver", "representive_referral", "primary_ehc", "secondary_ehc"],
      prefixes: ["applicant", "identification", "employment", "school", "representive", "primary_ehc", "secondary_ehc"],
    },
    "Accident & Insurance": {
      exact: ["accident_information", "insurance", "adjuster", "vehicle", "section_33", "lat_ab_counsel"],
      prefixes: ["accident", "insurance", "adjuster", "vehicle", "section_33", "lat"],
    },
    "Third Party": {
      exact: ["driver_information", "owner_information", "vehicle_information", "section_528", "tp_counsel"],
      prefixes: ["driver", "owner", "vehicle_information", "section_528", "tp_counsel"],
    },
    "Legal (SOC & Discovery)": {
      exact: ["soc", "statement_of_defence", "scheduled", "aod", "undertaking"],
      prefixes: ["soc", "statement", "scheduled", "aod", "undertaking"],
    },
    "Medical & Production": {
      exact: ["medical_centre", "production"],
      prefixes: ["medical", "production"],
    },
    "Documents & Correspondence": {
      exact: ["documents", "correspondence"],
      prefixes: ["documents", "correspondence"],
    },
    "Examinations": {
      exact: ["insurance_examination", "vsr_insurance_examination"],
      prefixes: ["insurance_examination", "vsr_insurance"],
    },
    "Tracking & Accounting": {
      exact: ["tracking", "accounting"],
      prefixes: ["tracking", "accounting"],
    },
    "Setup": {
      exact: ["user", "users", "role", "roles", "firm", "master"],
      prefixes: [
        "user",
        "role",
        "roles",
        "firm",
        "master",
        "setup",
        "permission",
        "permissions",
        "setting",
      ],
    },
  };

  const getCategoryForPermission = (permissionName) => {
    if (!permissionName) return "Other";
    const prefix = permissionName.toLowerCase().split(".")[0];

    for (const [category, { exact }] of Object.entries(sidebarCategories)) {
      if (exact?.includes(prefix)) return category;
    }

    for (const [category, { prefixes }] of Object.entries(sidebarCategories)) {
      if (prefixes?.some((p) => prefix.startsWith(p))) return category;
    }

    return "Other";
  };

  // Format permission name - capitalize first letter and remove underscores
  const formatPermissionName = (name) => {
    if (!name) return "";
    // Replace underscores with spaces and capitalize first letter of each word
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      const category = getCategoryForPermission(perm.name);
      acc[category] ||= [];
      acc[category].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Roles", link: "/dashboard/setup/roles", isNavigation: true },
    { title: "Role Details", isNavigation: false },
  ];

  const handleBack = () => {
    navigate("/dashboard/setup/roles");
  };

  const handleEdit = () => {
    setOpenEditor(true);
  };

  const handleDelete = () => {
    setOpenDelete(true);
  };

  const onConfirmDelete = () => {
    deleteRoleMutation(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar2 />
        <NavbarItem title="Role Details" breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar2 />
        <NavbarItem title="Role Details" breadcrumbs={breadcrumbs} />
        <div className="flex flex-col items-center justify-center flex-1">
          <Typography variant="h3" className="text-red-500 mb-2">
            Error loading role details
          </Typography>
          <Typography variant="p" className="text-gray-500 mb-4">
            {error.message || "Something went wrong"}
          </Typography>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar2 />
      <NavbarItem title="Role Details" breadcrumbs={breadcrumbs} />

      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <Typography variant="h2" className="text-2xl font-semibold">
                  Role Details
                </Typography>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="mb-6">
          <Typography variant="h3" className="text-xl font-semibold mb-4">
            Basic Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <Typography variant="small" className="text-gray-500 font-medium">
                    Role Name
                  </Typography>
                </div>
                <Typography variant="p" className="font-semibold">
                  {roleData.name || "-"}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <Typography variant="small" className="text-gray-500 font-medium">
                    Permissions Count
                  </Typography>
                </div>
                <Typography variant="p" className="font-semibold">
                  {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <Typography variant="small" className="text-gray-500 font-medium">
                    Created At
                  </Typography>
                </div>
                <Typography variant="p" className="font-semibold">
                  {roleData.created_at
                    ? new Date(roleData.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                    : "-"}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <Typography variant="small" className="text-gray-500 font-medium">
                    Last Updated
                  </Typography>
                </div>
                <Typography variant="p" className="font-semibold">
                  {roleData.updated_at
                    ? new Date(roleData.updated_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                    : "-"}
                </Typography>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-gray-700" />
            <Typography variant="h3" className="text-xl font-semibold">
              Permissions
            </Typography>
            <Badge variant="outline">
              {permissions.length} total
            </Badge>
          </div>

          {permissions.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <Card key={category}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <Typography variant="h4" className="text-lg font-semibold text-gray-900">
                        {category}
                      </Typography>
                      <Badge variant="secondary">
                        {perms.length} permission{perms.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <Typography variant="p" className="font-medium text-sm">
                              {formatPermissionName(permission.name)}
                            </Typography>
                            {permission.description && (
                              <Typography variant="small" className="text-gray-500 mt-1 text-xs">
                                {permission.description}
                              </Typography>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <Typography variant="h3" className="text-gray-500 mb-2">
                    No permissions assigned to this role
                  </Typography>
                  <Typography variant="p" className="text-gray-400 mb-4">
                    Click edit to assign permissions
                  </Typography>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <RoleEditor
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        roleData={roleData}
      />

      {/* Delete Confirmation */}
      <CustomDialog
        onOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title={roleData?.name || "this role"}
        modalType="Delete"
        onDelete={onConfirmDelete}
        id={roleData?.id}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RoleDetails;
