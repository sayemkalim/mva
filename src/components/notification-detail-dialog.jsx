import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiService } from "@/api/api_service/apiService";
import { toast } from "sonner";

export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [fileNo, setFileNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async () => {
    if (!fileNo.trim()) {
      toast.error("Please enter a file number");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms");
      return;
    }

    setSubmitting(true);
    try {
      // Submit notification response
      await apiService({
        endpoint: "api/v2/notification-response",
        method: "POST",
        data: {
          id: notification.id || notification.notificationId,
          action: "accept",
          file_no: fileNo,
        },
      });

      toast.success("Response submitted successfully");
      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setFileNo("");
      setAgreedToTerms(false);
    } catch (error) {
      console.error("Failed to submit notification response:", error);
      toast.error(error.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Details</DialogTitle>
          <DialogDescription>
            Review the notification and provide required information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Notification Details */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">From</Label>
              <p className="text-sm text-foreground">{notification?.name}</p>
            </div>

            <div>
              <Label className="text-sm font-semibold">Message</Label>
              <p className="text-sm text-foreground">{notification?.message}</p>
            </div>

            {notification?.time && (
              <div>
                <Label className="text-sm font-semibold">Time</Label>
                <p className="text-sm text-foreground">
                  {new Date(notification.time).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* File No Input */}
          <div className="space-y-2">
            <Label htmlFor="file-no">
              File Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file-no"
              placeholder="Enter file number"
              value={fileNo}
              onChange={(e) => setFileNo(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* I Agree Checkbox */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
              disabled={submitting}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="agree-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I Agree <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                I agree to accept this notification and provide the required information
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !fileNo.trim() || !agreedToTerms}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
