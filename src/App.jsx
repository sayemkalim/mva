import { Toaster } from "sonner";
import Router from "./router";
import { ThemeProvider } from "./components/theme";

const App = () => {
  return (
    <ThemeProvider>
      <Toaster position="top-center" richColors />
      <Router />
    </ThemeProvider>
  );
};

export default App;
