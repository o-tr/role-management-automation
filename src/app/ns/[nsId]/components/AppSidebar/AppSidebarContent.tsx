"use client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem
} from "@/components/ui/sidebar";
import Link from "next/link";
import {FC, ReactNode} from "react";
import {useParams, usePathname} from "next/navigation";
import {TbCloudCode, TbSettings, TbTags, TbTool, TbUsersGroup} from "react-icons/tb";

export const AppSidebarContent: FC = () => {
  const {nsId} = useParams<{nsId: string}>();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <MenuItem link={`/ns/${nsId}/members`} label={"メンバー管理"} icon={<TbUsersGroup/>}>
            <SidebarMenuSub>
              <MenuItem sub link={`/ns/${nsId}/members/add`} label={"追加"}/>
            </SidebarMenuSub>
          </MenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>グループ設定</SidebarGroupLabel>
        <SidebarMenu>
          <MenuItem link={`/ns/${nsId}/settings`} label={"基本設定"} icon={<TbSettings/>}/>
          <MenuItem link={`/ns/${nsId}/settings/tags`} label={"タグ管理"} icon={<TbTags/>}/>
          <MenuItem link={`/ns/${nsId}/settings/providers`} label={"外部プロバイダー"} icon={<TbCloudCode/>}/>
          <MenuItem link={`/ns/${nsId}/settings/admins`} label={"管理者"} icon={<TbTool/>}/>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}

type MenuItemProps = {
  sub?: boolean;
  link: string;
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const MenuItem:FC<MenuItemProps> = ({sub = false, link, label, icon, children}) => {
  const pathname = usePathname();
  if (sub) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={link === pathname}>
          <Link href={link}>{label}</Link>
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
}
