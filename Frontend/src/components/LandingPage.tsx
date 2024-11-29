"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ListTodo } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import { signIn } from 'next-auth/react';

const LoginPage = () => {
  const router = useRouter();

  const title: string =
    "AgileBot - Adaptive Solutions from Design to Deployment";
  const description: string =
    "An intelligent tool designed to streamline the software development process by transforming design documents into actionable user stories and well-structured sprint plans";

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/dashboard");
  }
  return (
    <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="grid grid-rows-2 gap-4 pl-8 pr-8 pt-10 sm:pl-10 sm:pr-10 md:pl-20 md:pr-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Second Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-center">
            <ListTodo
              className="w-[200px] h-[200px] text-black"
              aria-hidden="true"
            />
            <Label className="text-lg sm:text-2xl font-black" htmlFor="name">
              AgileBot
            </Label>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full sm:w-[300px] md:w-[350px]">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your email below to create your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Button
                    className="w-full flex items-center justify-center"
                    variant="outline"
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  >
                    <FaGoogle className="mr-2 h-5" />
                    Google
                  </Button>
                </div>
                <div className="flex items-center">
                  <Separator className="flex-grow mx-2 my-2 h-px w-16 border-t-2" />
                  <h4>or</h4>
                  <Separator className="flex-grow mx-2 my-2 h-px w-16 border-t-2" />
                </div>

                <form>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Email</Label>
                      <Input id="name" placeholder="example@gmail.com" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <Input id="name" placeholder="Password" />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full"  >Sign In</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
