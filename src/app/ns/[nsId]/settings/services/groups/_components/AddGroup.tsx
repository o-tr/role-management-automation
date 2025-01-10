"use client";
import { Button } from "@/components/ui/button";
import { FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FormEvent, useState } from "react";
import { onServiceGroupChange } from "../../_hooks/on-groups-change";
import { useAvailableGroups } from "../../_hooks/use-available-groups";
import { useCreateServiceGroup } from "../../_hooks/use-create-service-group";
import { useServiceAccounts } from "../../_hooks/use-service-accounts";

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accountId || !groupId) {
      return;
    }
    await createServiceGroup(groupId);
    onServiceGroupChange();
    setAccountId("");
    setGroupId("");
  };

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-row gap-2">
      <FormItem>
        <Select
          value={accountId}
          onValueChange={(value) => setAccountId(value)}
          disabled={loading}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="アカウント" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <span>{`${account.name} (${account.service})`}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
      <FormItem>
        <Select
          value={groupId}
          onValueChange={(value) => setGroupId(value)}
          disabled={!accountId || isGroupsPending || loading}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="グループ" />
          </SelectTrigger>
          <SelectContent>
            {isGroupsPending ? (
              <SelectItem value="tmp" disabled>
                Loading...
              </SelectItem>
            ) : (
              availableGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex flex-row items-center">
                    {group.icon && (
                      <img
                        src={group.icon}
                        alt={group.name}
                        className="w-6 h-6 mr-2"
                      />
                    )}
                    <span className="truncate">{group.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </FormItem>
      <Button disabled={loading}>追加</Button>
    </form>
  );
};
