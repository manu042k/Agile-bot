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
      <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="grid pl-8 pr-8 pt-10 sm:pl-10 sm:pr-10 md:pl-20 md:pr-20">
          {/* First Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* First Column */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
              <CardHeader>
                <CardTitle className="text-4xl sm:text-5xl md:text-6xl">
                  {title}
                </CardTitle>
                <CardDescription className="text-lg sm:text-xl md:text-2xl">
                  {description}
                </CardDescription>
              </CardHeader>
            </div>
          </div>
          <RetroGrid />

          {/* Second Row */}
          <div className="grid grid-cols-auto sm:grid-cols-2 gap-4 z-10">
            {/* Fixed AgileBot Section */}
            <div className="flex items-center justify-center sticky top-0 self-start">
              <ListTodo
                className="w-[200px] h-[200px] text-black"
                aria-hidden="true"
              />
              <Label
                className="text-lg sm:text-2xl font-black ml-4"
                htmlFor="name"
              >
                AgileBot
              </Label>
            </div>

            {/* Login/Register Tabs */}
            <div className="flex items-center justify-center">
              <Tabs defaultValue="Login" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="Login">Login</TabsTrigger>
                  <TabsTrigger value="Register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="Login">
                  <LoginComponents />
                </TabsContent>
                <TabsContent value="Register">
                  <RegisterComponent />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
