import { LoginForm } from "@/components/login-form";
import aihstLogo from "@/assets/logo-1.png";
import { ChevronRight } from "lucide-react";

const Login = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-black dark:via-black dark:to-black">
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <p className="text-sm text-foreground">
          Don't have account?{" "}
          <a
            href="/signup"
            className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
          >
            Sign Up
          </a>
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm bg-card p-8 rounded-xl shadow-lg border">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
