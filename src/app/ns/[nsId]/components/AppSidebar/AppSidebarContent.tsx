"use client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useNamespace } from "@/hooks/use-namespace";
import type { TNamespaceId } from "@/types/prisma";
import Link from "next/link";
import { redirect, useParams, usePathname } from "next/navigation";
import type { FC, ReactNode } from "react";
import {
  TbBuildings,
  TbCloudCode,
  TbMailShare,
  TbPlugConnected,
  TbSettings,
  TbTags,
  TbTool,
  TbUserCode,
  TbUserHexagon,
  TbUsersGroup,
} from "react-icons/tb";

export const AppSidebarContent: FC = () => {
  const { nsId } = useParams<{ nsId: TNamespaceId }>();
  const { namespace, responseError } = useNamespace({ namespaceId: nsId });

  if (responseError) {
    if (responseError.code === 404 || responseError.code === 403) {
      redirect("/ns");
      return;
    }
    if (responseError.code === 401) {
      redirect("/");
      return null;
    }
    return null;
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <MenuItem
            link={`/ns/${nsId}/members`}
            label={"メンバー管理"}
            icon={<TbUsersGroup />}
          />
          <MenuItem
            link={`/ns/${nsId}/roles/mappings`}
            label={"ロール管理"}
            icon={<TbUserHexagon />}
          >
            <SidebarMenuSub>
              <MenuItem
                sub
                link={`/ns/${nsId}/roles/mappings`}
                label={"割り当て"}
                icon={<TbPlugConnected />}
              />
              <MenuItem
                sub
                link={`/ns/${nsId}/roles/tags`}
                label={"タグ管理"}
                icon={<TbTags />}
              />
            </SidebarMenuSub>
          </MenuItem>
        </SidebarMenu>
      </SidebarGroup>
      {namespace?.isOwner && (
        <SidebarGroup>
          <SidebarGroupLabel>ネームスペース設定</SidebarGroupLabel>
          <SidebarMenu>
            <MenuItem
              link={`/ns/${nsId}/settings`}
              label={"基本設定"}
              icon={<TbSettings />}
            />
            <MenuItem
              link={`/ns/${nsId}/settings/services/accounts`}
              label={"外部サービス"}
              icon={<TbCloudCode />}
            >
              <SidebarMenuSub>
                <MenuItem
                  sub
                  link={`/ns/${nsId}/settings/services/accounts`}
                  label={"アカウント"}
                  icon={<TbUserCode />}
                />
                <MenuItem
                  sub
                  link={`/ns/${nsId}/settings/services/groups`}
                  label={"グループ"}
                  icon={<TbBuildings />}
                />
              </SidebarMenuSub>
            </MenuItem>
            <MenuItem
              link={`/ns/${nsId}/settings/admins`}
              label={"管理者"}
              icon={<TbTool />}
            >
              <SidebarMenuSub>
                <MenuItem
                  link={`/ns/${nsId}/settings/admins/invitations`}
                  label={"招待"}
                  icon={<TbMailShare />}
                />
              </SidebarMenuSub>
            </MenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
};

type MenuItemProps = {
  sub?: boolean;
  link: string;
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
};

const MenuItem: FC<MenuItemProps> = ({
  sub = false,
  link,
  label,
  icon,
  children,
}) => {
  const pathname = usePathname();
  if (sub) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={link === pathname}>
          <Link href={link}>
            {icon}
            {label}
          </Link>
        </SidebarMenuSubButton>
        {children}
      </SidebarMenuSubItem>
    );
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={link === pathname} asChild>
        <Link href={link}>
          {icon}
          {label}
        </Link>
      </SidebarMenuButton>
      {children}
    </SidebarMenuItem>
  );
};
