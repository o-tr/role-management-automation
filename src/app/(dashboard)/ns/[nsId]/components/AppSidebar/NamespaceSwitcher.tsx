"use client";

import { Avatar } from "@radix-ui/react-avatar";
import { ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { type FC, useCallback, useLayoutEffect, useState } from "react";
import { CreateNSForm } from "@/app/ns/components/CreateNSForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOnNsChange } from "@/events/on-ns-change";
import { useCurrentNamespace } from "@/hooks/use-current-namespace";
import { useNamespaces } from "@/hooks/use-namespaces";
import type { TNamespace } from "@/types/prisma";

export const NamespaceSwitcher: FC = () => {
  const { nsId } = useCurrentNamespace();

  const { namespaces, refetch } = useNamespaces();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState<TNamespace | undefined>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useLayoutEffect(() => {
    if (nsId) {
      const group = namespaces?.find((g) => g.id === nsId);
      if (group) {
        setActiveTeam(group);
      }
    }
  }, [nsId, namespaces]);

  const onNsChange = useCallback(() => {
    refetch();
  }, [refetch]);

  useOnNsChange(onNsChange);

  return (
    <Dialog open={createDialogOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeTeam && (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Avatar>{activeTeam.name[0]}</Avatar>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {activeTeam.name}
                      </span>
                    </div>
                  </>
                )}
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {namespaces?.map((namespace) => (
                <Link href={`/ns/${namespace.id}`} key={namespace.id}>
                  <DropdownMenuItem key={namespace.name} className="gap-2 p-2">
                    {namespace.name}
                  </DropdownMenuItem>
                </Link>
              ))}
              <DropdownMenuSeparator />
              <DialogTrigger asChild onClick={() => setCreateDialogOpen(true)}>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add team
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>グループを作成</DialogTitle>
          <DialogDescription>
            <CreateNSForm onCreated={() => setCreateDialogOpen(false)} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
