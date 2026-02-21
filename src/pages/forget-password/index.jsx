import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, XCircle, Lock, Key } from "lucide-react";
import { apiService } from "@/api/api_service/apiService";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({
    otp_code: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Forgot Password Mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      return await apiService({
        endpoint: "api/forgot-password",
        method: "POST",
        data: { email },
        removeToken: true,
      });
    },
    onSuccess: (data) => {
      // Assuming apiResponse returns an Apistatus or success flag
      const apiStatus = data?.Apistatus || data?.ApiApistatus || data?.response?.Apistatus || data?.response?.ApiApistatus;

      if (apiStatus === true || data?.response?.message?.includes("sent")) {
        console.log("Password reset link sent successfully");
        toast.success("Password reset link sent to your email!");
        setShowResetForm(true);
      } else {
        throw new Error(data?.message || data?.response?.message || "Failed to send reset link");
      }
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset link");
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      return await apiService({
        endpoint: "api/reset-password",
        method: "POST",
        data: {
          email: email,
          otp_code: data.otp_code,
          password: data.password,
          password_confirmation: data.password_confirmation,
        },
        removeToken: true,
      });
    },
    onSuccess: (data) => {
      const apiStatus = data?.Apistatus || data?.ApiApistatus || data?.response?.Apistatus || data?.response?.ApiApistatus;

      if (apiStatus === true || data?.response?.message?.includes("success")) {
        console.log("Password reset successful");
        toast.success("Password reset successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(data?.message || data?.response?.message || "Failed to reset password");
      }
    },
    onError: (error) => {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to reset password");
    },
  });

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      return "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.";
    }
    return "";
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    forgotPasswordMutation.mutate(email);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();

    if (
      !resetData.otp_code ||
      !resetData.password ||
      !resetData.password_confirmation
    ) {
      return;
    }

    // Password validation
    const passwordValidationError = validatePassword(resetData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // Check if passwords match
    if (resetData.password !== resetData.password_confirmation) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    resetPasswordMutation.mutate(resetData);
  };

  const handleResetDataChange = (field, value) => {
    setResetData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "password" || field === "password_confirmation") {
      setPasswordError("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {!showResetForm ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {!showResetForm
              ? "Enter your email address to receive an OTP"
              : "Enter OTP and create a new password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Email Form - Shows by default */}
          {!showResetForm && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={forgotPasswordMutation.isPending}
                  />
                </div>
              </div>

              {forgotPasswordMutation.isError && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {forgotPasswordMutation.error?.message ||
                      "Failed to send reset code. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>

              <div className="text-center text-sm">
                <a
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </a>
              </div>
            </form>
          )}

          {/* Reset Password Form - Shows only after email success */}
          {showResetForm && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  OTP sent to {email}. Check your email!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  OTP Code
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={resetData.otp_code}
                    onChange={(e) =>
                      handleResetDataChange("otp_code", e.target.value)
                    }
                    className="pl-10"
                    required
                    disabled={resetPasswordMutation.isPending}
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={resetData.password}
                    onChange={(e) =>
                      handleResetDataChange("password", e.target.value)
                    }
                    className="pl-10"
                    required
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Must include 1 uppercase, 1 lowercase, 1 number, and 1 symbol
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password_confirmation"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password_confirmation"
                    type="password"
                    placeholder="Confirm new password"
                    value={resetData.password_confirmation}
                    onChange={(e) =>
                      handleResetDataChange(
                        "password_confirmation",
                        e.target.value
                      )
                    }
                    className="pl-10"
                    required
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>
              </div>

              {passwordError && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}

              {resetPasswordMutation.isSuccess && (() => {
                const apiStatus = resetPasswordMutation.data?.Apistatus || resetPasswordMutation.data?.ApiApistatus || resetPasswordMutation.data?.response?.Apistatus || resetPasswordMutation.data?.response?.ApiApistatus;
                return apiStatus === true || resetPasswordMutation.data?.response?.message?.includes("success");
              })() && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Password reset successful! Redirecting to login...
                    </AlertDescription>
                  </Alert>
                )}

              {resetPasswordMutation.isError && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {resetPasswordMutation.error?.message ||
                      "Failed to reset password. Please check your OTP."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  className="text-primary hover:underline font-medium"
                  disabled={resetPasswordMutation.isPending}
                >
                  Back to Email
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
