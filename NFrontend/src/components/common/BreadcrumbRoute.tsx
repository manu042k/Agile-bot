import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Utility function to capitalize the first letter of a string
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const path = "/" + pathSegments.slice(0, index + 1).join("/");
          const capitalizedSegment = capitalizeFirstLetter(segment);
          return (
            <>
              <BreadcrumbItem key={path}>
                {index < pathSegments.length - 1 && (
                  <BreadcrumbLink href={path}>
                    {capitalizedSegment}
                  </BreadcrumbLink>
                )}
                {index === pathSegments.length - 1 && (
                  <BreadcrumbPage>{capitalizedSegment}</BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {index < pathSegments.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNavigation;
