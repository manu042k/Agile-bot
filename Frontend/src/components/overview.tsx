"use client";
import React from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "./ui/form";
  import { Input } from "./ui/input";
  import { Button } from "./ui/button";
import { useForm } from 'react-hook-form';
import { SquarePen } from 'lucide-react';
import { Separator } from './ui/separator';

const Overview = () => {
    const onSubmit = (data: any) => {
        console.log(data);
      };
      const form = useForm();
      
  return (
<>
    <h2 className="text-2xl font-bold">Overview-{}</h2>

        <p className="mt-4">
          This is the main content area. The sidebar and navbar remain visible,
          while this section scrolls with the content.
        </p>
        <Separator className="my-4" />
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 grid-rows-3 gap-6">
        
        <div>
          <FormField
            control={form.control}
            name="TeamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black">Team Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of members"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="ml-1">
                  Specify the number of members in your team.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="Timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black">Timeline</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Project timeline" {...field} />
                </FormControl>
                <FormDescription className="ml-1">
                  Enter the timeline for your project in weeks.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="DesignDoc"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black">Upload Design Doc</FormLabel>
                <FormControl>
                  <Input type="file" {...field} />
                </FormControl>
                <FormDescription className="ml-1">
                  Upload your design document here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="SprintSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black">Sprint Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Sprint size"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="ml-1">
                  Specify the size of each sprint.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button type="submit" className=" justify-items-endcol-span-2">
          <SquarePen />
          Generate User Stories
          </Button>
        </div>
      </div>
    </form>
  </Form>
  </>
  )
}

export default Overview
