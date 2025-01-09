import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExternalAccount, ExternalProvider, Role } from "@prisma/client";
import { useState } from "react";

interface ExternalAccountFormProps {
  groupExternalProviders: (ExternalProvider & {
    roles: Role[];
  })[];
  userExternalAccounts: ExternalAccount[];
  onSave: (account: ExternalAccount) => void;
  onCancel: () => void;
}

export default function ExternalAccountForm({
  groupExternalProviders,
  userExternalAccounts,
  onSave,
  onCancel,
}: ExternalAccountFormProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    null,
  );

  const availableProviders = groupExternalProviders.filter(
    (provider) =>
      !userExternalAccounts.some(
        (account) => account.externalProviderId === provider.id,
      ),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProviderId) {
      onSave({
        id: Date.now(),
        userId: userExternalAccounts[0].userId,
        externalProviderId: selectedProviderId,
      } as ExternalAccount);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="externalProvider">外部プロバイダー</Label>
        <Select
          value={selectedProviderId?.toString() ?? ""}
          onValueChange={(value) =>
            setSelectedProviderId(Number.parseInt(value))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="プロバイダーを選択" />
          </SelectTrigger>
          <SelectContent>
            {availableProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id.toString()}>
                {provider.provider}: {provider.providerId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!selectedProviderId}>
          保存
        </Button>
      </div>
    </form>
  );
}
