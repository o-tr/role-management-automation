import { redirect } from "next/navigation";
import GroupDetails from "../components/GroupDetails";
import InviteAdminForm from "../components/InviteAdminForm";

type Props = {
  params: {
    nsId: string;
  };
};

export default async function GroupSettingsPage({ params: { nsId } }: Props) {
  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-6">
        グループ設定: {namespace.name}
      </h1>
      <GroupDetails namespace={namespace} isOwner={isOwner} />
      {/*<ExternalProviderList groupId={namespace.id} externalProviders={group.externalProviders} />*/}
      {/* {isOwner && <InviteAdminForm groupId={namespace.id} />} */}
    </div>
  );
}
