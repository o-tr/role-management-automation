"use server";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import type { FC } from "react";
import { AppSidebarContent } from "./AppSidebarContent";
import { NamespaceSwitcher } from "./NamespaceSwitcher";

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
