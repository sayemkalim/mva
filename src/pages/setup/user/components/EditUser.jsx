import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Camera, User } from "lucide-react";
import { toast } from "sonner";

import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import { fetchUserById } from "../helpers/fetchUserById";
import { updateUser } from "../helpers/updateUser";
import { fetchUserMeta } from "../helpers/fetchUserMeta";
import { BACKEND_URL } from "@/utils/url";
import { refreshUserPermissions } from "@/utils/permissions";
import { getItem } from "@/utils/local_storage";

const initialFormState = {
  role_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  street_number: "",
  street_name: "",
  unit_number: "",
  city: "",
  province: "",
  postal_code: "",
  country: "",
  password: "",
  password_confirmation: "",
};

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormState);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [originalRoleId, setOriginalRoleId] = useState(null);

  // Fetch user data
  const { data: apiResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });

  // Fetch roles from API
  const { data: metaResponse } = useQuery({
    queryKey: ["userMeta"],
    queryFn: fetchUserMeta,
  });

  const roles = metaResponse?.response?.roles || [];

  // Prefill form when user data is loaded
  useEffect(() => {
    const user = apiResponse?.response?.data;
    if (user) {
      // Ensure role_id is properly set - check for role object or role_id field
      const roleId = user.role?.id || user.role_id || "";

      setFormData({
        role_id: String(roleId),
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        street_number: user.street_number || "",
        street_name: user.street_name || "",
        unit_number: user.unit_number || "",
        city: user.city || "",
        province: user.province || "",
        postal_code: user.postal_code || "",
        country: user.country || "",
        password: "",
        password_confirmation: "",
      });
      setOriginalRoleId(String(roleId));
      if (user.profile_picture) {
        // Construct proper URL for existing profile picture
        if (user.profile_picture.startsWith("http")) {
          setProfilePreview(user.profile_picture);
        } else {
          const cleanPath = user.profile_picture.replace(/\\/g, "/");
          setProfilePreview(`${BACKEND_URL}/storage/${cleanPath}`);
        }
      }
    }
  }, [apiResponse]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateUser(id, data),
    onSuccess: async (apiResponse) => {
      if (apiResponse?.response?.Apistatus || apiResponse?.response) {
        toast.success("User updated successfully!");
        
        // Invalidate user-related queries
        await queryClient.invalidateQueries(["userList"]);
        await queryClient.invalidateQueries(["user", id]);
        await queryClient.invalidateQueries(["userMeta"]);
        
        // Check if the current logged-in user is the one being edited
        const currentUserId = getItem("userId");
        if (currentUserId && String(currentUserId) === String(id)) {
          // Check if the role was changed
          if (originalRoleId && formData.role_id && originalRoleId !== formData.role_id) {
            // Update the stored role ID
            const { setItem } = await import("@/utils/local_storage");
            setItem({ userRole: formData.role_id });
            
            // Refresh permissions from API
            await refreshUserPermissions();
            
            // Invalidate all queries to force components to refetch
            await queryClient.invalidateQueries();
            
            toast.info("Your role and permissions have been updated");
          }
        }
        
        navigate("/dashboard/setup/user");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update user. Please try again.");
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name || !formData.last_name) {
      toast.error("First name and last name are required");
      return;
    }
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    if (!formData.role_id) {
      toast.error("Please select a role");
      return;
    }

    // Password validation only if password is being changed
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        toast.error("Passwords do not match");
        return;
      }
    }

    // Create FormData for file upload
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    if (profilePicture) {
      submitData.append("profile_picture", profilePicture);
    }

    updateMutation.mutate(submitData);
  };

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Users", url: "/dashboard/setup/user", isNavigation: true },
    { title: "Edit User", isNavigation: false },
  ];

  if (isLoadingUser) {
    return (
      <div className="flex flex-col">
        <Navbar2 />
        <NavbarItem title="Edit User" breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Edit User" breadcrumbs={breadcrumbs} />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-foreground mb-8">Edit User</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role_id}
                onValueChange={(value) => handleChange("role_id", value)}
              >
                <SelectTrigger className="h-10 bg-card border-input">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personal Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    placeholder="John"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    placeholder="Doe"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="john@example.com"
                    className="h-10 bg-muted border-input cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Phone Number
                  </Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleChange("phone_number", e.target.value)
                    }
                    placeholder="+1234567890"
                    className="h-10 bg-card border-input"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.street_number}
                    onChange={(e) =>
                      handleChange("street_number", e.target.value)
                    }
                    placeholder="123"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.street_name}
                    onChange={(e) =>
                      handleChange("street_name", e.target.value)
                    }
                    placeholder="Main St"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.unit_number}
                    onChange={(e) =>
                      handleChange("unit_number", e.target.value)
                    }
                    placeholder="4B"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Toronto"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Province</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    placeholder="Ontario"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) =>
                      handleChange("postal_code", e.target.value)
                    }
                    placeholder="M5V 2K7"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="Canada"
                    className="h-10 bg-card border-input"
                  />
                </div>
              </div>
            </div>

            {/* Password (Optional for edit) */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Change Password{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (Leave blank to keep current password)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="h-10 bg-card border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      handleChange("password_confirmation", e.target.value)
                    }
                    placeholder="••••••••"
                    className="h-10 bg-card border-input"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/setup/user")}
                disabled={updateMutation.isPending}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                size="lg"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
