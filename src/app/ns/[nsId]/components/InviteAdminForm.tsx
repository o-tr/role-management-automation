"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InviteAdminFormProps {
  groupId: string;
}

export default function InviteAdminForm({ groupId }: InviteAdminFormProps) {
  const [adminEmail, setAdminEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteAdmin(groupId, adminEmail);
    setAdminEmail("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">管理者を招待</h2>
      <div>
        <Label htmlFor="adminEmail">管理者のメールアドレス</Label>
        <Input
          id="adminEmail"
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="例: admin@example.com"
          required
        />
      </div>
      <Button type="submit">招待</Button>
    </form>
  );
}
