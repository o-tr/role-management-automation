"use server";
import { FC } from "react";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { NamespaceSwitcher } from "./NamespaceSwitcher";
import { AppSidebarContent } from "./AppSidebarContent";

export const AppSidebar: FC = async () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NamespaceSwitcher />
      </SidebarHeader>
      <AppSidebarContent />
      <SidebarFooter>Footer</SidebarFooter>
    </Sidebar>
  );
};
