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
import { Loader2, Mail, CheckCircle, XCircle, Lock, Key, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/api/api_service/apiService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({
    otp_code: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    setErrors({});
    forgotPasswordMutation.mutate(email);
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (errors.email) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!resetData.otp_code) newErrors.otp_code = "OTP Code is required";
    if (!resetData.password) newErrors.password = "New Password is required";
    if (!resetData.password_confirmation)
      newErrors.password_confirmation = "Password confirmation is required";

    if (resetData.password) {
      const passwordValidationError = validatePassword(resetData.password);
      if (passwordValidationError) {
        newErrors.password = passwordValidationError;
      }
    }

    if (
      resetData.password &&
      resetData.password_confirmation &&
      resetData.password !== resetData.password_confirmation
    ) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    resetPasswordMutation.mutate(resetData);
  };

  const handleResetDataChange = (field, value) => {
    setResetData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
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
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                    errors.email ? "text-red-500" : "text-gray-400"
                  )} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={cn(
                      "pl-10 h-11",
                      errors.email && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={forgotPasswordMutation.isPending}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-red-500 ml-1">
                    {errors.email}
                  </p>
                )}
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

              <div className="space-y-1">
                <Label htmlFor="otp" className="text-sm font-medium">
                  OTP Code
                </Label>
                <div className="relative">
                  <Key className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                    errors.otp_code ? "text-red-500" : "text-gray-400"
                  )} />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={resetData.otp_code}
                    onChange={(e) =>
                      handleResetDataChange("otp_code", e.target.value)
                    }
                    className={cn(
                      "pl-10 h-11",
                      errors.otp_code && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={resetPasswordMutation.isPending}
                    maxLength={6}
                  />
                </div>
                {errors.otp_code && (
                  <p className="text-xs font-medium text-red-500 ml-1">
                    {errors.otp_code}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                    errors.password ? "text-red-500" : (resetData.password && validatePassword(resetData.password) === "" ? "text-green-500" : "text-gray-400")
                  )} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={resetData.password}
                    onChange={(e) =>
                      handleResetDataChange("password", e.target.value)
                    }
                    className={cn(
                      "pl-10 pr-10 h-11 transition-colors",
                      errors.password ? "border-red-500 focus-visible:ring-red-500" : (resetData.password && validatePassword(resetData.password) === "" && "border-green-500 focus-visible:ring-green-500")
                    )}
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 ml-1">
                  <span className="text-[10px] font-bold text-gray-500 mr-1">
                    Must include:
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors flex items-center gap-1",
                    /[A-Z]/.test(resetData.password) ? "text-green-500" : "text-gray-400"
                  )}>
                    <span className="text-[8px]">●</span> Uppercase
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors flex items-center gap-1",
                    /[a-z]/.test(resetData.password) ? "text-green-500" : "text-gray-400"
                  )}>
                    <span className="text-[8px]">●</span> Lowercase
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors flex items-center gap-1",
                    /[0-9]/.test(resetData.password) ? "text-green-500" : "text-gray-400"
                  )}>
                    <span className="text-[8px]">●</span> Number
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors flex items-center gap-1",
                    /[!@#$%^&*(),.?":{}|<>]/.test(resetData.password) ? "text-green-500" : "text-gray-400"
                  )}>
                    <span className="text-[8px]">●</span> Symbol
                  </span>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 ml-1 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password_confirmation"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                    errors.password_confirmation ? "text-red-500" : (resetData.password_confirmation && resetData.password === resetData.password_confirmation ? "text-green-500" : "text-gray-400")
                  )} />
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={resetData.password_confirmation}
                    onChange={(e) =>
                      handleResetDataChange(
                        "password_confirmation",
                        e.target.value
                      )
                    }
                    className={cn(
                      "pl-10 pr-10 h-11 transition-colors",
                      errors.password_confirmation ? "border-red-500 focus-visible:ring-red-500" : (resetData.password_confirmation && resetData.password === resetData.password_confirmation && "border-green-500 focus-visible:ring-green-500")
                    )}
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-xs font-medium text-red-500 ml-1">
                    {errors.password_confirmation}
                  </p>
                )}
              </div>

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
