import React from "react";
import { CirclePlus, Folder, ListTodo } from "lucide-react";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import NavBar from "./NavBar";

const ProductList = () => {
  return (
    <>
      <NavBar></NavBar>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Dialog>
            {/* Trigger */}
            <DialogTrigger asChild>
              <a
                href="#"
                className="block group aspect-video rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors">
                    <CirclePlus className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-black group-hover:text-gray-900">
                    Add Project
                  </h3>
                </div>
              </a>
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="sm:max-w-[425px]  md:max-w-[700px] lg:max-w-[800px] ">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new project. 
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project-name" className="text-right block truncate font-semibold">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project-desc" className="text-right block truncate font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="project-desc"
                    className="col-span-3"
                    placeholder="Type your message here."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project-desc" className="text-right block truncate font-semibold">
                    Visibilty
                  </Label>
                  <RadioGroup defaultValue="comfortable">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="r1" />
                      <Label htmlFor="r1">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comfortable" id="r2" />
                      <Label htmlFor="r2">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <a
            href="#"
            className="block group aspect-video rounded-xl bg-slate-100 hover:bg-muted/70 transition-colors"
          >
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="flex mt-5 items-center justify-center w-12 h-12 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors">
                <Folder className="w-6 h-6 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-black group-hover:text-gray-900">
                Project Title
              </h3>
              <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-800 text-center">
                A brief description of the project goes here, giving a quick
                overview.
              </p>
            </div>
          </a>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>

      {/* Model */}
    </>
  );
};

export default ProductList;
