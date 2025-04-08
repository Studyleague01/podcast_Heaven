import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { useThemeStore, getEffectiveTheme } from "./store/themeStore";

// Initialize theme from stored preference or system
const initialTheme = useThemeStore.getState().theme;
const effectiveTheme = getEffectiveTheme(initialTheme);
document.documentElement.classList.add(effectiveTheme);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
