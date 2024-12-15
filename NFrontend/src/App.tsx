import React from "react";
import { BrowserRouter as Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login-page";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainLayout from "./layouts/main";
import ProjectsPage from "./pages/projects-page";
import ProjectLayout from "./layouts/projects";
import ProfilePage from "./pages/profile-page";
import TeamPage from "./pages/team-page";
import TeamMemberPage from "./pages/teamMember-page";
import OverviewPage from "./pages/overview-page";
import BoardPage from "./pages/board-page";
import TaskPage from "./pages/task-page";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route
            path="/projects/:projectId/overview"
            element={<PrivateRoute component={OverviewPage} />}
          />
          <Route
            path="/projects/:projectId/board"
            element={<PrivateRoute component={BoardPage} />}
          />
          <Route
            path="/projects/:projectId/tasks"
            element={<PrivateRoute component={TaskPage} />}
          />
        </Route>
        <Route path="/" element={<ProjectLayout />}>
          <Route
            path="/projects"
            element={<PrivateRoute component={ProjectsPage} />}
          />
          <Route
            path="/profile"
            element={<PrivateRoute component={ProfilePage} />}
          />
          <Route
            path="/teams"
            element={<PrivateRoute component={TeamPage} />}
          />

          <Route
            path="/teams/:teamId"
            element={<PrivateRoute component={TeamMemberPage} />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
