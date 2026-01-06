import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  Calendar,
  Shield,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { fetchUserById } from "../helpers/fetchUserById";
import { BACKEND_URL } from "@/utils/url";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http")) return profilePicture;
  const cleanPath = profilePicture.replace(/\\/g, "/");
  return `${BACKEND_URL}/storage/${cleanPath}`;
};

const ViewUserDialog = ({ open, onClose, userId }) => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: open && !!userId,
  });

  const extractUser = (response) => {
    if (!response) return null;
    if (response?.response?.data) return response.response.data;
    // console.log("API Response:>>>>>>>>>>>user ", response);
    return null;
  };

  const user = extractUser(apiResponse);
  console.log("API Response:>>>>>>>>>>>user ", user);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading user details...</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center py-4">
            Failed to load user details. Please try again.
          </div>
        )}

        {user && !isLoading && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.profile_picture ? (
                  <img
                    src={getProfilePictureUrl(user.profile_picture)}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {user.first_name?.[0] || ""}
                    {user.last_name?.[0] || ""}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{user.role || "-"}</span>
                </div>
              </div>
              <div className="ml-auto">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <p className="text-sm">{user.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Phone
                    </Label>
                    <p className="text-sm">{user.phone_number || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Address</h4>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm">
                    {[
                      user.unit_number && `Unit ${user.unit_number}`,
                      user.street_number,
                      user.street_name,
                    ]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[user.city, user.province, user.postal_code]
                      .filter(Boolean)
                      .join(", ") || ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.country || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Firm Information */}
            {user.firm && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Firm Information
                </h4>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Firm Name
                    </Label>
                    <p className="text-sm">{user.firm.firm_name || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-gray-900">Account Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Created
                    </Label>
                    <p>{safeFormat(user.created_at, "dd MMM yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Last Login
                    </Label>
                    <p>
                      {safeFormat(user.last_login_at, "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDialog;
