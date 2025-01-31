"use client";
import type { TNamespaceId } from "@/types/prisma";
import { BreadcrumbUpdater } from "../../../components/Breadcrumb/BreadcrumbUpdater";
import { CreateInvitation } from "./_components/CreateInvitation";
import { InvitationsList } from "./_components/InvitationsList";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  { label: "管理者", path: "/ns/[nsId]/settings/admins" },
  { label: "招待", path: "/ns/[nsId]/settings/admins/invitations" },
];

type Props = {
  params: {
    nsId: TNamespaceId;
  };
};

export default function GroupSettingsPage({ params: { nsId } }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-end">
        <CreateInvitation nsId={nsId} />
      </div>
      <InvitationsList nsId={nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
