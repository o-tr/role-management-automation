import { BreadcrumbUpdater } from "@/app/ns/[nsId]/settings/tags/BreadcrumbUpdater";
import ExternalProviderList from "../../components/ExternalProviderList";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getGroup } from "@/lib/group";

export default async function GroupProvidersPage({
  params,
}: {
  params: { groupId: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const groupId = params.groupId;
  const result = await getGroup(groupId);

  if (!result) {
    return <div>Group not found</div>;
  }
  const { group, isOwner } = result;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">グループ設定: {group.name}</h1>
      <ExternalProviderList
        groupId={group.id}
        externalProviders={group.externalProviders}
      />
      <BreadcrumbUpdater />
    </div>
  );
}
