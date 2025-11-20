"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFoundComponent = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white py-12 px-6">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button className="bg-black hover:bg-gray-800 text-white">
            Go Back Home
          </Button>
        </Link>
      </div>

      {/* Illustration from shacdn */}
      <div className="max-w-md w-full mx-auto">
        <img
          src="https://cdn.jsdelivr.net/gh/shacdn/shacdn/404.svg"
          alt="Page Not Found"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default NotFoundComponent;
