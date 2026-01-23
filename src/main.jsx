import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SearchProvider } from "./context/SearchBar.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
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
