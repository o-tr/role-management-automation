import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onNsChange } from "@/events/on-ns-change";
import { useNamespace } from "@/hooks/use-namespace";
import { useSetNamespaceName } from "@/hooks/use-set-namespace-name";
import type { TNamespaceId } from "@/types/prisma";
import { redirect } from "next/navigation";
import { type FC, useEffect, useId, useState } from "react";

type Props = {
  nsId: TNamespaceId;
};

export const EditNSName: FC<Props> = ({ nsId }) => {
  const { namespace, isPending, refetch } = useNamespace({ namespaceId: nsId });
  const { setNamespaceName, isLoading } = useSetNamespaceName(nsId);
  const [name, setName] = useState("");

  const inputId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setNamespaceName(name);
    onNsChange();
    refetch();
  };

  useEffect(() => setName(namespace?.name ?? ""), [namespace]);

  if (!namespace || isPending) {
    return <p>Loading...</p>;
  }

  if (namespace.isOwner === false) {
    redirect(`/ns/${nsId}`);
    return null;
  }

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
        <Button disabled={isLoading || namespace?.name === name}>変更</Button>
      </div>
    </form>
  );
};
