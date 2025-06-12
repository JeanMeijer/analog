import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tasks } from "./tasks";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function RightSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarRail />
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <Tabs defaultValue="events" className="w-full">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="tasks">Task</TabsTrigger>
          </TabsList>
          <TabsContent value="events">Make changes to your events here.</TabsContent>
          <TabsContent value="tasks"><Tasks/></TabsContent>
        </Tabs>
      </SidebarContent>
    </Sidebar>
  );
}
