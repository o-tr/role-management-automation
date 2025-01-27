import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onNsChange } from "@/events/on-ns-change";
import { useSetNamespaceName } from "@/hooks/use-set-namespace-name";
import type { TNamespaceDetailWithRelation } from "@/types/prisma";
import { type FC, useId, useState } from "react";

type Props = {
  namespace: TNamespaceDetailWithRelation;
  refetch: () => void;
};

export const EditNSName: FC<Props> = ({ namespace, refetch }) => {
  const [name, setName] = useState(namespace.name);
  const { setNamespaceName, isLoading } = useSetNamespaceName(namespace.id);

  const inputId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setNamespaceName(name);
    onNsChange();
    refetch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor={inputId}>ネームスペース名を編集</Label>
      <div className="flex items-center space-x-2">
        <Input
          id={inputId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新しいネームスペース名"
          disabled={isLoading}
        />
        <Button disabled={isLoading}>変更</Button>
      </div>
    </form>
  );
};
