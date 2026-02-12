import { Toaster } from "sonner";
import Router from "./router";
import { ThemeProvider } from "./components/theme";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationContainer from "./components/notification-container";

const App = () => {
  return (
    // <ThemeProvider>
    //   <NotificationProvider>
    //     <Toaster position="top-center" richColors />
    //     <NotificationContainer />
    //     <Router />
    //   </NotificationProvider>
    // </ThemeProvider>
    <div className="text-red-500">Hello World</div>
  );
};

export default App;
