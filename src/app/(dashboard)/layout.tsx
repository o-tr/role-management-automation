import Link from "next/link";
import type { ReactNode } from "react";
import { TbBook } from "react-icons/tb";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./ns/[nsId]/components/AppSidebar";
import {
  BreadcrumbDisplay,
  BreadcrumbProvider,
} from "./ns/[nsId]/components/Breadcrumb";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="bg-background p-2 flex flex-row justify-between sticky top-0 z-10">
            <div className={"flex flex-row items-center justify-start"}>
              <SidebarTrigger size={"icon"} className={"w-10 h-10"} />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbDisplay />
            </div>
            <div className={"flex flex-row items-center justify-end gap-2"}>
              <Link href="/user-guide">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <TbBook className="mr-2 h-4 w-4" />
                  ガイド
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <TbBook className="h-4 w-4" />
                </Button>
              </Link>
              <ModeToggle />
            </div>
          </header>
          <main className={"px-4 flex-grow-0 pb-4"}>{children}</main>
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
