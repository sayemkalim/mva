import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react";
import { apiService } from "@/api/api_service/apiService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
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
      if (data.response?.success) {
        console.log("Password reset link sent successfully");
      }
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password{" "}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address to receive an OTP
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input Field */}
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

            {/* Success Message */}
            {forgotPasswordMutation.isSuccess &&
              forgotPasswordMutation.data?.response?.success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Send Reset Code
                  </AlertDescription>
                </Alert>
              )}

            {/* Error Message */}
            {forgotPasswordMutation.isError && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Error
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
                </>
              ) : (
                "                    Send Reset Code"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
