import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          {/* Overview Page */}
          <Route
            path="/projects/:projectId/"
            element={<PrivateRoute component={OverviewPage} />}
          />
          {/* Board Page */}
          <Route
            path="/projects/:projectId/board"
            element={<PrivateRoute component={BoardPage} />}
          />
          {/* Task Page */}
          <Route
            path="/projects/:projectId/tasks"
            element={<PrivateRoute component={TaskPage} />}
          />
        </Route>

        {/* Project Layout Routes */}
        <Route path="/" element={<ProjectLayout />}>
          {/* Projects Page */}
          <Route
            path="/projects"
            element={<PrivateRoute component={ProjectsPage} />}
          />
          {/* Profile Page */}
          <Route
            path="/profile"
            element={<PrivateRoute component={ProfilePage} />}
          />
          {/* Teams Page */}
          <Route
            path="/teams"
            element={<PrivateRoute component={TeamPage} />}
          />
          {/* Team Member Page */}
          <Route
            path="/teams/:teamId"
            element={<PrivateRoute component={TeamMemberPage} />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
