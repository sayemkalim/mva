import aihstLogo from "@/assets/logo-1.png";
import { SignupForm } from "@/components/sign-up-form";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-black dark:via-black dark:to-black">
      {/* <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <img src={aihstLogo} alt="Logo" className="h-10 w-10" />
      </div> */}

      {/* Login - Top Right */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <p className="text-sm text-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
          >
            Login
          </Link>
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg bg-card p-8 rounded-xl shadow-lg border">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default Signup;
