import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Bell, Maximize, Minimize, Sun, Moon } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";

export function Navbar2() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-muted">
      {/* Left side: SidebarTrigger */}
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
      </div>

      {/* Right side: Other buttons and time */}
      <div className="flex items-center gap-4">
        <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <Button
            variant="ghost"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="h-6 w-6" />
            ) : (
              <Maximize className="h-6 w-6" />
            )}
          </Button>
        </Tooltip>

        <div className="font-mono text-sm">{time.toLocaleTimeString()}</div>

        <Tooltip content="Notifications">
          <Button
            variant="ghost"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-8 w-8" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
          </Button>
        </Tooltip>

        <Tooltip
          content={
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Sun className="h-8 w-8" />
            ) : (
              <Moon className="h-8 w-8" />
            )}
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
}
