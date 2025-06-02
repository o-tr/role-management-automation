"use client";
import { ServiceAccountPicker } from "@/app/(dashboard)/ns/[nsId]/components/ServiceAccountPicker";
import { ServiceGroupPicker } from "@/app/(dashboard)/ns/[nsId]/components/ServiceGroupPicker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormItem } from "@/components/ui/form";
import { type FormEvent, useState } from "react";
import { useServiceAccounts } from "../../../../_hooks/use-service-accounts";
import { onServiceGroupChange } from "../../_hooks/on-groups-change";
import { useAvailableGroups } from "../../_hooks/use-available-groups";
import { useCreateServiceGroup } from "../../_hooks/use-create-service-group";

export const AddGroup = ({ nsId }: { nsId: string }) => {
  const { accounts, isPending } = useServiceAccounts(nsId);
  const [accountId, setAccountId] = useState<string>("");
  const { availableGroups, isPending: isGroupsPending } = useAvailableGroups(
    nsId,
    accountId,
  );
  const [groupId, setGroupId] = useState<string>("");
  const { createServiceGroup, loading } = useCreateServiceGroup(
    nsId,
    accountId,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accountId || !groupId) {
      return;
    }
    const result = await createServiceGroup(groupId);
    if (result.status === "error") {
      setError(result.error);
      return;
    }
    onServiceGroupChange();
    setAccountId("");
    setGroupId("");
  };
  console.log(groupId);

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <FormItem>
          <ServiceAccountPicker
            accounts={accounts || []}
            onChange={setAccountId}
            disabled={loading}
            value={accountId}
          />
        </FormItem>
        <FormItem>
          <ServiceGroupPicker
            groups={availableGroups}
            disabled={!accountId || isGroupsPending || loading}
            value={groupId}
            onChange={setGroupId}
          />
        </FormItem>
        <Button disabled={loading}>追加</Button>
      </form>
      {error && (
        <Alert
          variant={"destructive"}
          className="flex flex-row justify-between items-center"
        >
          <span>{error}</span>
          <Button onClick={() => setError(null)}>OK</Button>
        </Alert>
      )}
    </div>
  );
};
