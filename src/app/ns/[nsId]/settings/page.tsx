"use client";
import { EditNSName } from "@/app/ns/[nsId]/settings/_components/EditNSName";
import { useNamespace } from "@/hooks/use-namespace";
import { redirect } from "next/navigation";
import GroupDetails from "../components/GroupDetails";

type Props = {
  params: {
    nsId: string;
  };
};

export default function GroupSettingsPage({ params: { nsId } }: Props) {
  const {namespace,isPending,refetch} = useNamespace({namespaceId: nsId});
  if (isPending) {
    return <p>Loading...</p>;
  }
  if (!namespace) {
    redirect("/ns");
    return <></>;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        グループ設定: {namespace.name}
      </h1>
      <EditNSName namespace={namespace} refetch={refetch} key={namespace.name} />
      <GroupDetails namespace={namespace} />
      {/* <h1 className="text-2xl font-bold mb-6">
        グループ設定: {namespace.name}
      </h1>
      <GroupDetails namespace={namespace} isOwner={isOwner} />
      {/*<ExternalProviderList groupId={namespace.id} externalProviders={group.externalProviders} />*/}
      {/* {isOwner && <InviteAdminForm groupId={namespace.id} />} */}
    </div>
  );
}
