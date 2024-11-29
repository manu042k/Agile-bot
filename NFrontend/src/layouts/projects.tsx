import NavBarComponent from "@/components/common/NavBarComponent";
import { Outlet } from "react-router-dom";

const ProjectLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Navbar */}
      <NavBarComponent />

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 mt-16 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ProjectLayout;
