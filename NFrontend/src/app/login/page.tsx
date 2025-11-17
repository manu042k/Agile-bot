"use client";
import LoginComponents from "@/components/auth/LoginComponents";
import RegisterComponent from "@/components/auth/RegisterComponents";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo } from "lucide-react";
import RetroGrid from "@/components/ui/retro-grid";

const LoginPage = () => {
  const title: string =
    "AgileBot - Adaptive Solutions from Design to Deployment";
  const description: string =
    "An intelligent tool designed to streamline the software development process by transforming design documents into actionable user stories and well-structured sprint plans";

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">
        <RetroGrid />
        <div className="relative z-10 min-h-screen px-8 py-12 lg:px-20">
          {/* Top Section - Title and Description */}
          <div className="mb-12 max-w-4xl">
            <CardHeader className="p-0">
              <CardTitle className="text-5xl font-bold tracking-tight text-black lg:text-6xl">
                {title}
              </CardTitle>
              <CardDescription className="mt-6 text-xl text-gray-600 lg:text-2xl">
                {description}
              </CardDescription>
            </CardHeader>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Icon and Logo */}
            <div className="flex items-start">
              <div className="flex items-center gap-4">
                <ListTodo className="h-32 w-32 text-black" strokeWidth={1.5} />
                <span className="text-3xl font-semibold text-black">
                  AgileBot
                </span>
              </div>
            </div>

            {/* Right Column - Auth Forms */}
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <div className="rounded-xl border bg-white p-8 shadow-md">
                  <Tabs defaultValue="account" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="account">Login</TabsTrigger>
                      <TabsTrigger value="password">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="mt-0">
                      <LoginComponents />
                    </TabsContent>
                    <TabsContent value="password" className="mt-0">
                      <RegisterComponent />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
