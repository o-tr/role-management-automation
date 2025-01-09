import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

const paths = [
  { label: "ネームスペース設定", path: `/ns/[nsId]/settings` },
  {
    label: "外部サービス",
    path: `/ns/[nsId]/settings/providers`,
  },
]

export default async function GroupProvidersPage({
  params,
}: {
  params: { groupId: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div>
      <BreadcrumbUpdater paths={paths} />
    </div>
  )
  // const groupId = params.groupId;
  // if (!result) {
  //   return <div>Group not found</div>;
  // }
  // const { group, isOwner } = result;
  // return (
  //   <div>
  //     <h1 className="text-2xl font-bold mb-6">グループ設定: {group.name}</h1>
  //     <ExternalProviderList
  //       groupId={group.id}
  //       externalProviders={group.externalProviders}
  //     />
  //     <BreadcrumbUpdater />
  //   </div>
  // );
}
