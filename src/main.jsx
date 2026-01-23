import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import "./index.css";
import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SearchProvider } from "./context/SearchBar.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter> 
        <AuthProvider>
          <SearchProvider>
            <ProjectProvider>
              <App />
            </ProjectProvider>
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);