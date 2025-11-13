import { LoginForm } from "@/components/login-form";
import aihstLogo from "@/assets/logo-1.png";
import { ChevronRight } from "lucide-react";

const Login = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <img src={aihstLogo} alt="Logo" className="h-10 w-10" />
      </div> */}

      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <p className="text-sm text-gray-700">
          Don't have account?{" "}
          <a
            href="/signup"
            className="font-medium text-gray-900 hover:underline inline-flex items-center gap-1"
          >
            Sign Up
          </a>
        </p>
      </div>

      {/* Login Form - Centered */}
      <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
