"use client";
import { FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAvailableGroups } from "../../_hooks/use-available-groups";
import { useServiceAccounts } from "../../_hooks/use-service-accounts";

export const AddGroup = ({ nsId }: { nsId: string }) => {
  const { accounts, isPending } = useServiceAccounts(nsId);
  const [accountId, setAccountId] = useState<string>("");
  const { availableGroups, isPending: isGroupsPending } = useAvailableGroups(
    nsId,
    accountId,
  );
  const [groupId, setGroupId] = useState<string>("");

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <form>
      <FormItem>
        <Select
          value={accountId}
          onValueChange={(value) => setAccountId(value)}
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
          disabled={!accountId || isGroupsPending}
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
    </form>
  );
};
