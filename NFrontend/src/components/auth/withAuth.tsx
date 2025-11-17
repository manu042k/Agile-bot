"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();

    useEffect(() => {
      if (!authService.isAuthenticated()) {
        router.replace("/");
      }
    }, [router]);

    if (!authService.isAuthenticated()) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;

/*
How to use:
1. Import withAuth HOC in your page file.
   e.g., import withAuth from '@/components/auth/withAuth';
2. Wrap your page component with the HOC.
   e.g., export default withAuth(MySecurePage);
*/
