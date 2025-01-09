"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNamespace } from "@/requests/createNamespace";
import { TNamespace } from "@/types/prisma";

type Props = {
  onCreated?: (created: TNamespace) => void;
};

export const CreateNSForm: FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const namespace = await createNamespace(name);
    setName("");
    onCreated?.(namespace);
    router.push(`/ns/${namespace.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">新規ネームスペース作成</h2>
      <div>
        <Label htmlFor="groupName">ネームスペース名</Label>
        <Input
          id="groupName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Button type="submit">作成</Button>
    </form>
  );
};
