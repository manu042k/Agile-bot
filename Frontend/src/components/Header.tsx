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
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ListTodo  } from 'lucide-react'

const Header = () => {
  return (
    <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
    <div className="grid grid-rows-2 gap-4 pl-20 pr-10 pt-10">
  {/* First Row */}
  <div className="grid grid-cols-4 gap-4">
    {/* First Column */}
    <div className="col-span-3">
      <CardHeader>
        <CardTitle className="text-6xl">
        AgileBot - Adaptive Solutions from Design to Deployment        </CardTitle>
        <CardDescription className="text-2xl">
        An intelligent tool designed to streamline the software development process by transforming design documents into actionable user stories and well-structured sprint plans
        </CardDescription>
      </CardHeader>
    </div>
  </div>

  {/* Second Row */}
  <div className="grid grid-cols-2 gap-4">
    <div>
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
    </div>
    <div>
    <div className="flex items-center justify-center">
      <ListTodo  className="w-24 h-24 text-black" aria-hidden="true" />

      <Label className='text-2xl font-black' htmlFor="name">AgileBot</Label>
      </div>
    </div>
  </div>
</div>
</div>
  );
};

export default Header;
