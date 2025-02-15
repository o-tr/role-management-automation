"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateNamespace } from "@/hooks/use-create-namespace";
import type { TNamespace } from "@/types/prisma";
import { useRouter } from "next/navigation";
import { type FC, useId, useState } from "react";

type Props = {
  onCreated?: (created: TNamespace) => void;
};

export const CreateNSForm: FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState("");
  const router = useRouter();
  const { createNamespace, isLoading } = useCreateNamespace();

  const inputId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const namespace = await createNamespace(name);
    if (namespace.status === "error") return;
    setName("");
    onCreated?.(namespace.namespace);
    router.push(`/ns/${namespace.namespace.id}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor={inputId}>ネームスペースを作成</Label>
      <div className="flex items-center space-x-2">
        <Input
          id={inputId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ネームスペース名"
          disabled={isLoading}
        />
        <Button disabled={isLoading}>作成</Button>
      </div>
    </form>
  );
};
