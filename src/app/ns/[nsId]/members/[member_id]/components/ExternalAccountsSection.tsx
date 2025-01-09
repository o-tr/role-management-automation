import { Button } from "@/components/ui/button";
import type { ExternalAccount, ExternalProvider, Role } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import ExternalAccountForm from "./ExternalAccountForm";
import ExternalAccountItem from "./ExternalAccountItem";

interface ExternalAccountsSectionProps {
  userExternalAccounts: (ExternalAccount & {
    externalProvider: ExternalProvider & {
      roles: Role[];
    };
  })[];
  groupExternalProviders: (ExternalProvider & {
    roles: Role[];
  })[];
  onUpdate: (updatedAccounts: ExternalAccount[]) => void;
}

export default function ExternalAccountsSection({
  userExternalAccounts,
  groupExternalProviders,
  onUpdate,
}: ExternalAccountsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (newAccount: ExternalAccount) => {
    onUpdate([...userExternalAccounts, newAccount]);
    setIsAdding(false);
  };

  const handleRemove = (accountId: number) => {
    const updatedAccounts = userExternalAccounts.filter(
      (account) => account.id !== accountId,
    );
    onUpdate(updatedAccounts);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">外部アカウント</h2>
      {userExternalAccounts.map((account) => (
        <ExternalAccountItem
          key={account.id}
          account={account}
          onRemove={() => handleRemove(account.id)}
        />
      ))}
      {isAdding ? (
        <ExternalAccountForm
          groupExternalProviders={groupExternalProviders}
          userExternalAccounts={userExternalAccounts}
          onSave={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <Button onClick={() => setIsAdding(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          外部アカウントを追加
        </Button>
      )}
    </div>
  );
}
