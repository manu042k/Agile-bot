import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "./ui/breadcrumb";
import { Label } from './ui/label';
import { ListTodo } from 'lucide-react';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface NavBarProps {

  className?: string;

}

const NavBar = () => {
  return (
    <header className="fixed flex h-16 shrink-0 items-center gap-2 border-b px-4 w-full ">
    <ListTodo
      className="w-[20px] h-[20px] text-black font-bold "
      aria-hidden="true"
    />
    <Label className="text-lg sm:text-lg font-bold" htmlFor="name">
      AgileBot
    </Label>

    <Separator orientation="vertical" className="mr-2 h-4 ml-[130px]" />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">
            Building Your Application
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Data Fetching</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <div className="flex items-center ml-auto hover:bg-gray-200 p-2 rounded-lg">
      {/* Avatar */}
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="user" />
        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="ml-3 text-left text-sm">
        <span className="block truncate font-semibold">username</span>
        <span className="block truncate text-xs text-gray-500">
          useremail@gmail.com
        </span>
      </div>
    </div>
  </header>
  )
}

export default NavBar
