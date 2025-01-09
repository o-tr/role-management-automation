"use client";

import { Button } from "@/components/ui/button";
import { ExternalProvider } from "@prisma/client";
import { removeExternalProvider } from "../../actions";
import { AddExternalProviderForm } from "@/app/ns/[nsId]/components/AddExternalProviderForm";
import { GroupId } from "@/types/brandTypes";
import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { columns } from "@/app/ns/[nsId]/components/columns";

type TExternalProvider = ExternalProvider & { groupId: GroupId };

interface ExternalProviderListProps {
  groupId: GroupId;
  externalProviders: TExternalProvider[];
}

const deleteProviders = async (groupId: GroupId, providerIds: string[]) => {
  await Promise.all(
    providerIds.map((providerId) => removeExternalProvider(groupId, providerId))
  );
};

export default function ExternalProviderList({
  groupId,
  externalProviders,
}: ExternalProviderListProps) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">外部プロバイダー</h2>
      <DataTable columns={columns} data={externalProviders} />
      <AddExternalProviderForm groupId={groupId} />
    </div>
  );
}
