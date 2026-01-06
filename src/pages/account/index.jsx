import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { getItem } from "@/utils/local_storage";
import { toast } from "sonner";
import { BACKEND_URL } from "@/utils/url";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  Edit2,
  Save,
  Loader2,
  Camera,
  X,
  Globe,
  Home,
  Hash,
} from "lucide-react";

// API helper functions
const fetchCurrentUser = async () => {
  const userId = getItem("userId");
  if (!userId) throw new Error("User ID not found");

  const response = await apiService({
    endpoint: `${endpoints.showUser}/${userId}`,
    method: "GET",
  });

  if (response.error) throw new Error("Failed to fetch user data");
  return response.response?.data || response.response;
};

const updateUserData = async ({ userId, data }) => {
  const response = await apiService({
    endpoint: `${endpoints.updateUser}/${userId}`,
    method: "POST",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.error) throw new Error("Failed to update user data");
  return response.response;
};

const AccountPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
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
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch current user data
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(["currentUser"]);
      setIsEditing(false);
      setProfilePicture(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update profile");
    },
  });

  // Populate form when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        street_number: userData.street_number || "",
        street_name: userData.street_name || "",
        unit_number: userData.unit_number || "",
        city: userData.city || "",
        province: userData.province || "",
        postal_code: userData.postal_code || "",
        country: userData.country || "",
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Profile picture must be less than 2MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    const userId = getItem("userId");
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    // Add role_id
    if (userData?.role_id) {
      submitData.append("role_id", userData.role_id);
    }

    if (profilePicture) {
      submitData.append("profile_picture", profilePicture);
    }

    updateMutation.mutate({ userId, data: submitData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setPreviewUrl(null);
    // Reset form to original data
    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        street_number: userData.street_number || "",
        street_name: userData.street_name || "",
        unit_number: userData.unit_number || "",
        city: userData.city || "",
        province: userData.province || "",
        postal_code: userData.postal_code || "",
        country: userData.country || "",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (userData?.profile_picture) {
      if (userData.profile_picture.startsWith("http")) {
        return userData.profile_picture;
      }
      const cleanPath = userData.profile_picture.replace(/\\/g, "/");
      return `${BACKEND_URL}/storage/${cleanPath}`;
    }
    return null;
  };

  const getFullName = () => {
    const firstName = userData?.first_name || "";
    const lastName = userData?.last_name || "";
    return `${firstName} ${lastName}`.trim() || "User";
  };

  const getInitials = () => {
    const firstName = userData?.first_name || "";
    const lastName = userData?.last_name || "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  };

  const getFullAddress = () => {
    const parts = [
      userData?.unit_number && `Unit ${userData.unit_number}`,
      userData?.street_number,
      userData?.street_name,
      userData?.city,
      userData?.province,
      userData?.postal_code,
      userData?.country,
    ].filter(Boolean);
    return parts.join(", ") || "N/A";
  };

  const getPhoneWithCode = () => {
    const code = userData?.country_code?.code || "";
    const phone = userData?.phone_number || "";
    return phone ? `${code} ${phone}` : "N/A";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Navbar2 />
        <NavbarItem title="Account Settings" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <Navbar2 />
        <NavbarItem title="Account Settings" />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Navbar2 />
      <NavbarItem title="Account Settings" />

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              {/* Avatar with edit option */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getAvatarUrl()} alt={getFullName()} />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-md"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    {(previewUrl || userData?.profile_picture) && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full shadow-md"
                        onClick={handleRemoveProfilePicture}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold">{getFullName()}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">
                    {userData?.role_name || userData?.role || "N/A"}
                  </span>
                  {userData?.firm?.firm_name && (
                    <>
                      <span className="mx-2">•</span>
                      <Building className="h-4 w-4" />
                      <span>{userData.firm.firm_name}</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                {isEditing ? (
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {userData?.first_name || "N/A"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {userData?.last_name || "N/A"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="flex-1"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {userData?.email || "N/A"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      className="flex-1"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {getPhoneWithCode()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street_number">Street Number</Label>
                  <Input
                    id="street_number"
                    value={formData.street_number}
                    onChange={(e) =>
                      handleInputChange("street_number", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street_name">Street Name</Label>
                  <Input
                    id="street_name"
                    value={formData.street_name}
                    onChange={(e) =>
                      handleInputChange("street_name", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_number">Unit Number</Label>
                  <Input
                    id="unit_number"
                    value={formData.unit_number}
                    onChange={(e) =>
                      handleInputChange("unit_number", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) =>
                      handleInputChange("province", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) =>
                      handleInputChange("postal_code", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {getFullAddress()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground capitalize">
                    {userData?.role_name || userData?.role || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Firm</Label>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {userData?.firm?.firm_name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      userData?.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {userData?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Verified</Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      userData?.email_verified_at
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {userData?.email_verified_at
                      ? formatDate(userData.email_verified_at)
                      : "Not verified"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {formatDate(userData?.created_at)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(userData?.last_login_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
