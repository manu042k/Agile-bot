import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from './ui/label';
import { CirclePlus } from 'lucide-react';

const DialogComponent = () => {
  return (
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Project Name
            </Label>
            <Input id="project-name" placeholder="Enter project name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-desc" className="text-right">
              Description
            </Label>
            <Input id="project-desc" placeholder="Enter description" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Dialog
