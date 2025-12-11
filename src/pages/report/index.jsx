import React from "react";
import { Button } from "@/components/ui/button";
import { Navbar2 } from "@/components/navbar2";

const ReportPage = () => {
  const handleGoogleLink = () => {
    // window.open("https://accounts.google.com", "_blank");
  };

  const handleMicrosoftLink = () => {
    // window.open("https://login.microsoftonline.com", "_blank");
  };

  return (
    <div>
      <Navbar2 />

      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="space-y-6 w-full max-w-sm">
          <Button
            onClick={handleGoogleLink}
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl 
            transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 
            flex items-center justify-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="45px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	          s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	          s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.104,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
	          l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.203-5.231C29.211,35.091,26.715,36,24,36
	          c-5.202,0-9.619-3.317-11.283-7.946l-6.553,5.047C9.581,39.556,16.302,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.094,5.569
	          c0.001-0.001,0.002-0.001,0.003-0.002l6.203,5.231C40.367,35.186,44,29.309,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Link with Google
          </Button>

          <Button
            onClick={handleMicrosoftLink}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl 
            transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 
            flex items-center justify-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 23 23"
              width="26px"
            >
              <rect width="10" height="10" x="1" y="1" fill="#f25022" />
              <rect width="10" height="10" x="12" y="1" fill="#7fba00" />
              <rect width="10" height="10" x="1" y="12" fill="#00a4ef" />
              <rect width="10" height="10" x="12" y="12" fill="#ffb900" />
            </svg>
            Link with Microsoft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
