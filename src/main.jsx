import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/ThemeContext.jsx";
import { SearchProvider } from "./components/SearchBar.jsx";
import { ProjectProvider } from "./pages/projects/ProjectContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <SearchProvider>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </SearchProvider>
    </ThemeProvider>
  </StrictMode>
);
