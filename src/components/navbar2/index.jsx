import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Bell, Maximize, Minimize, Sun, Moon } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { useTheme } from "../theme";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"; // Make sure Sheet components are imported

export function Navbar2() {
  // Fullscreen logic
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Timer logic as before
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };
  const handlePause = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
  };
  const handleResume = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
  };
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
    const effectiveTheme = theme === "system" ? "light" : theme;
    const newTheme = effectiveTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };
  const timerDisplay = new Date(seconds * 1000).toISOString().substr(11, 8);

  // Sheet open state
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-muted">
      {/* Left side: SidebarTrigger */}
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
      </div>

      {/* Center: Timer Controls */}
      <div className="flex items-center gap-2 bg-white rounded px-2 py-1 shadow">
        <Button
          onClick={
            !isActive ? handleStart : isPaused ? handleResume : handlePause
          }
          variant="outline"
        >
          {!isActive ? "Start" : isPaused ? "Resume" : "Pause"}
        </Button>
        <div className="font-mono text-lg min-w-[100px]">{timerDisplay}</div>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={!isActive && seconds === 0}
        >
          Reset
        </Button>
      </div>

      {/* Right side: Other buttons */}
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
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Tooltip content="Notifications">
              <Button
                variant="ghost"
                className="relative"
                aria-label="Notifications"
                onClick={() => setSheetOpen(true)}
              >
                <Bell className="h-8 w-8" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
              </Button>
            </Tooltip>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="p-4 text-lg font-semibold">Notifications</div>
            <div className="p-4"></div>
          </SheetContent>
        </Sheet>

        <Tooltip
          content={
            theme === "light"
              ? "Switch to Dark Mode"
              : theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Light/Dark Mode"
          }
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Sun className="h-8 w-8" />
            ) : theme === "dark" ? (
              <Moon className="h-8 w-8" />
            ) : (
              <Sun className="h-8 w-8" />
            )}
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
}
