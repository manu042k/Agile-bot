import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login-page";
import TestPage from "./pages/test-page";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainLayout from "./layouts/main";
import ProjectsPage from "./pages/projects-page";
import ProjectLayout from "./layouts/projects";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<PrivateRoute component={TestPage} />}
          />
        </Route>
        <Route path="/" element={<ProjectLayout />}>
          <Route
            path="/projects"
            element={<PrivateRoute component={ProjectsPage} />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
