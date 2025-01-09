"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExternalProvider } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMember } from "../../actions";

interface AddMemberFormProps {
  groupId: number;
  externalProviders: ExternalProvider[];
}

export default function AddMemberForm({
  groupId,
  externalProviders,
}: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [externalAccounts, setExternalAccounts] = useState<
    Record<number, string>
  >({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMember(groupId, { name, email, externalAccounts });
    setName("");
    setEmail("");
    setExternalAccounts({});
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">メンバーを追加</h2>
      <div>
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {externalProviders.map((provider) => (
        <div key={provider.id}>
          <Label htmlFor={`provider-${provider.id}`}>{provider.name}</Label>
          <Input
            id={`provider-${provider.id}`}
            value={externalAccounts[provider.id] || ""}
            onChange={(e) =>
              setExternalAccounts((prev) => ({
                ...prev,
                [provider.id]: e.target.value,
              }))
            }
            required
          />
        </div>
      ))}
      <Button type="submit">追加</Button>
    </form>
  );
}
