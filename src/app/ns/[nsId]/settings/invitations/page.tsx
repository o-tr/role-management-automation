"use client";
import type { TNamespaceId } from "@/types/prisma";
import { BreadcrumbUpdater } from "../../components/Breadcrumb/BreadcrumbUpdater";
import { CreateInvitation } from "./_components/CreateInvitation";
import { InvitationsList } from "./_components/InvitationsList";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  { label: "招待", path: "/ns/[nsId]/invitations" },
];

type Props = {
  params: {
    nsId: TNamespaceId;
  };
};

export default function GroupSettingsPage({ params: { nsId } }: Props) {
  return (
    <div>
      <InvitationsList nsId={nsId} />
      <CreateInvitation nsId={nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
