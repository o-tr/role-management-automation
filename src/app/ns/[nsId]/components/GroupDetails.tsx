"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TNamespaceDetail } from "@/types/prisma";
import { Namespace, User } from "@prisma/client";
import { useState } from "react";

interface GroupDetailsProps {
  namespace: TNamespaceDetail;
}

export default function GroupDetails({ namespace }: GroupDetailsProps) {
  const [newOwnerEmail, setNewOwnerEmail] = useState("");

  const handleTransferOwnership = async () => {
    setNewOwnerEmail("");
  };

  return (
    <div className="space-y-4 mb-6">
      <p>
        <strong>所有者:</strong> {namespace.owner.name}
      </p>
      <p>
        <strong>管理者:</strong>{" "}
        {namespace.admins.map((admin) => admin.name).join(", ")}
      </p>
      {namespace.isOwner && (
        <div>
          <Label htmlFor="newOwner">所有権の譲渡</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="newOwner"
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              placeholder="新しい所有者のメールアドレス"
            />
            <Button onClick={handleTransferOwnership}>譲渡</Button>
          </div>
        </div>
      )}
    </div>
  );
}
