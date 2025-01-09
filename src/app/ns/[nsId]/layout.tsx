import { FC, ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { getServerSession } from "next-auth/next";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbDisplay, BreadcrumbProvider } from "./components/Breadcrumb";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background p-2 flex flex-row justify-between">
            <div className={"flex flex-row items-center justify-start"}>
              <SidebarTrigger size={"icon"} className={"w-10 h-10"} />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbDisplay />
            </div>
            <div className={"flex flex-row items-center justify-end"}>
              <ModeToggle />
            </div>
          </header>
          <main className={"px-4"}>{children}</main>
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
