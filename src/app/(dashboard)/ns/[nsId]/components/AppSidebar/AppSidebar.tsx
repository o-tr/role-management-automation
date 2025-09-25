"use server";
import Link from "next/link";
import type { FC } from "react";
import { TbBook } from "react-icons/tb";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { AppSidebarContent } from "./AppSidebarContent";
import { NamespaceSwitcher } from "./NamespaceSwitcher";

export const AppSidebar: FC = async () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NamespaceSwitcher />
      </SidebarHeader>
      <AppSidebarContent />
      <SidebarFooter>
        <Link
          href="/user-guide"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <TbBook className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            ユーザーガイド
          </span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};
