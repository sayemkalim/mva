import { Toaster } from "sonner";
import Router from "./router";
import { ThemeProvider } from "./components/theme";
import { NotificationProvider } from "./context/NotificationContext";
import { TimerProvider } from "./context/TimerContext";
import NotificationContainer from "./components/notification-container";

const App = () => {
  return (
    <ThemeProvider>
      <TimerProvider>
        <NotificationProvider>
          <Toaster position="top-center" richColors />
          <NotificationContainer />
          <Router />
        </NotificationProvider>
      </TimerProvider>
    </ThemeProvider>
  );
};

export default App;
