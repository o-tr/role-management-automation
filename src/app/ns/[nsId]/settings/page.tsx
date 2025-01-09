"use client";
import { EditNSName } from "@/app/ns/[nsId]/settings/_components/EditNSName";
import { useNamespace } from "@/hooks/use-namespace";
import { redirect } from "next/navigation";
import { BreadcrumbUpdater } from "../components/Breadcrumb/BreadcrumbUpdater";
import GroupDetails from "../components/GroupDetails";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  { label: "基本設定", path: "/ns/[nsId]/settings" },
];

type Props = {
  params: {
    nsId: string;
  };
};

export default function GroupSettingsPage({ params: { nsId } }: Props) {
  const { namespace, isPending, refetch } = useNamespace({ namespaceId: nsId });
  if (isPending) {
    return <p>Loading...</p>;
  }
  if (!namespace) {
    redirect("/ns");
    return <></>;
  }
  return (
    <div>
      <EditNSName
        namespace={namespace}
        refetch={refetch}
        key={namespace.name}
      />
      <GroupDetails namespace={namespace} />
      <BreadcrumbUpdater paths={paths} />
      {/* 
      <GroupDetails namespace={namespace} isOwner={isOwner} />
      {/*<ExternalProviderList groupId={namespace.id} externalProviders={group.externalProviders} />*/}
      {/* {isOwner && <InviteAdminForm groupId={namespace.id} />} */}
    </div>
  );
}
