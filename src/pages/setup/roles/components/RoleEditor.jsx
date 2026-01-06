import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Search } from "lucide-react";
import { toast } from "sonner";
import { createRole, updateRole, getPermissionsList, showRole } from "../helpers";
import Typography from "@/components/typography";
import { refreshUserPermissions } from "@/utils/permissions";
import { getItem } from "@/utils/local_storage";

const RoleEditor = ({ open, onClose, roleData = null }) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(roleData);

  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
  });

  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------- Format permission name ---------------- */
  const formatPermissionName = (name) => {
    if (!name) return "";
    // Replace underscores with spaces and capitalize first letter of each word
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /* ---------------- Fetch permissions list ---------------- */
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissionsList"],
    queryFn: getPermissionsList,
    enabled: open,
  });

  const permissionsList = permissionsResponse?.response?.data || [];

  /* ---------------- Fetch full role details when editing ---------------- */
  const { data: roleDetailsResponse, isLoading: isLoadingRoleDetails } = useQuery({
    queryKey: ["roleDetails", roleData?.id],
    queryFn: () => showRole(roleData.id),
    enabled: open && isEdit && Boolean(roleData?.id),
  });

  const isLoading = isLoadingPermissions || isLoadingRoleDetails;

  /* ---------------- Sidebar categories ---------------- */
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

  /* ---------------- Group permissions ---------------- */
  const groupedPermissions = permissionsList.reduce((acc, perm) => {
    const category = getCategoryForPermission(perm.name);
    acc[category] ||= [];
    acc[category].push(perm);
    return acc;
  }, {});

  /* ---------------- Search filter ---------------- */
  const filteredGroupedPermissions = Object.entries(groupedPermissions).reduce(
    (acc, [category, perms]) => {
      if (!searchQuery) {
        acc[category] = perms;
        return acc;
      }

      const q = searchQuery.toLowerCase();
      const filtered = perms.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          category.toLowerCase().includes(q)
      );

      if (filtered.length) acc[category] = filtered;
      return acc;
    },
    {}
  );

  /* ---------------- PRELOAD ROLE PERMISSIONS (FIXED) ---------------- */
  useEffect(() => {
    if (!open) return;

    if (isEdit && roleDetailsResponse) {
      // Use the full role details from the API
      const fullRoleData = roleDetailsResponse?.response?.data || roleDetailsResponse?.data;
      const permissionIds = Array.isArray(fullRoleData?.permissions)
        ? fullRoleData.permissions.map((p) =>
            String(typeof p === "object" ? p.id ?? p._id : p)
          )
        : [];

      setFormData({
        name: fullRoleData?.name || roleData?.name || "",
        permissions: permissionIds,
      });
    } else if (!isEdit) {
      // Creating new role
      setFormData({ name: "", permissions: [] });
    }

    setSearchQuery("");
  }, [roleData, roleDetailsResponse, open, isEdit]);

  /* ---------------- Mutations ---------------- */
  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        permissions: data.permissions.map((id) => parseInt(id, 10)),
      };
      return isEdit ? updateRole(roleData.id, payload) : createRole(payload);
    },
    onSuccess: async () => {
      toast.success(isEdit ? "Role updated" : "Role created");
      
      // Invalidate all role-related queries
      await queryClient.invalidateQueries(["rolesList"]);
      await queryClient.invalidateQueries(["permissionsList"]);
      
      // If editing and the current user has this role, refresh their permissions
      if (isEdit) {
        const currentUserRole = getItem("userRole");
        if (currentUserRole && String(currentUserRole) === String(roleData.id)) {
          // Refresh permissions from API
          await refreshUserPermissions();
          
          // Invalidate all queries to force components to refetch
          await queryClient.invalidateQueries();
          
          toast.info("Your permissions have been updated");
        }
      }
      
      onClose();
    },
    onError: () => toast.error("Operation failed"),
  });

  /* ---------------- Handlers ---------------- */
  const togglePermission = (id) => {
    const pid = String(id);
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(pid)
        ? prev.permissions.filter((p) => p !== pid)
        : [...prev.permissions, pid],
    }));
  };

  const selectAll = () =>
    setFormData((p) => ({
      ...p,
      permissions: permissionsList.map((x) => String(x.id)),
    }));

  const clearAll = () => setFormData((p) => ({ ...p, permissions: [] }));

  const selectCategory = (category) => {
    const ids = groupedPermissions[category].map((p) => String(p.id));
    setFormData((p) => ({
      ...p,
      permissions: Array.from(new Set([...p.permissions, ...ids])),
    }));
  };

  const deselectCategory = (category) => {
    const ids = groupedPermissions[category].map((p) => String(p.id));
    setFormData((p) => ({
      ...p,
      permissions: p.permissions.filter((id) => !ids.includes(id)),
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    mutation.mutate(formData);
  };

  /* ---------------- UI ---------------- */
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isEdit ? "Edit Role" : "Add Role"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6">
          {/* Role Name Section */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter role name"
              className="h-10 bg-white border-gray-300"
            />
          </div>

          {/* Permissions Section */}
          <div className="border-t pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.permissions.length} selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    onClick={selectAll}
                    className="h-9"
                  >
                    Select All
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    onClick={clearAll}
                    className="h-9"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 h-10 bg-white border-gray-300"
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border rounded-lg bg-white shadow-sm">
                  {Object.entries(filteredGroupedPermissions).map(
                    ([category, perms]) => {
                      const ids = perms.map((p) => String(p.id));
                      const selected = ids.filter((id) =>
                        formData.permissions.includes(id)
                      ).length;

                      return (
                        <div key={category} className="border-b last:border-b-0">
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                            <div className="flex items-center gap-2">
                              <Typography className="font-semibold text-gray-900">
                                {category}
                              </Typography>
                              <Badge variant="outline" className="ml-2">
                                {selected}/{ids.length}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => selectCategory(category)}
                                className="h-8 text-xs"
                              >
                                Select
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => deselectCategory(category)}
                                className="h-8 text-xs"
                              >
                                Deselect
                              </Button>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 p-4">
                            {perms.map((p) => (
                              <div 
                                key={p.id} 
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <Checkbox
                                  checked={formData.permissions.includes(
                                    String(p.id)
                                  )}
                                  onCheckedChange={() => togglePermission(p.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatPermissionName(p.name)}
                                  </div>
                                  <small className="text-xs text-muted-foreground">
                                    {p.description}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              disabled={mutation.isPending}
              size="lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              size="lg"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Role" : "Create Role"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleEditor;
