import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import { addUser } from "../helpers/addUser";
import { fetchUserMeta } from "../helpers/fetchUserMeta";

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

export default function AddUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormState);

  // Fetch roles from API
  const { data: metaResponse, isLoading: isLoadingMeta } = useQuery({
    queryKey: ["userMeta"],
    queryFn: fetchUserMeta,
  });

  const roles = metaResponse?.response?.roles || [];

  const createMutation = useMutation({
    mutationFn: addUser,
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "User created successfully!");
      queryClient.invalidateQueries(["userList"]);
      navigate("/dashboard/setup/user");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to create user. Please try again.");
      }
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    createMutation.mutate(formData);
  };

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Users", url: "/dashboard/setup/user", isNavigation: true },
    { title: "Add User", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Add User" breadcrumbs={breadcrumbs} />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-foreground mb-8">
            Add New User
          </h1>

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
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className="h-10 bg-card border-input"
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

            {/* Password */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-foreground mb-4">Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Password <span className="text-red-500">*</span>
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
                    Confirm Password <span className="text-red-500">*</span>
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
                disabled={createMutation.isPending}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                size="lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
