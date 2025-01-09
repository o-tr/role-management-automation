"use client";

import { MultiSelect } from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Member, Tag } from "@prisma/client";
import { useState } from "react";

interface MemberListProps {
  members: Member[];
  groupId: string;
  tags: Tag[];
}

export default function MemberList({
  members,
  groupId,
  tags,
}: MemberListProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleMemberSelect = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleAddTags = async () => {
    // await addTagsToMembers(groupId, selectedMembers, selectedTags);
    setSelectedMembers([]);
    setSelectedTags([]);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">メンバー</h2>
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center space-x-2">
            <Checkbox
              id={`member-${member.id}`}
              checked={selectedMembers.includes(member.id)}
              onCheckedChange={() => handleMemberSelect(member.id)}
            />
            <label htmlFor={`member-${member.id}`}>
              {member.name} ({member.email})
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <MultiSelect
          options={tags.map((tag) => ({
            value: tag.id.toString(),
            label: tag.name,
          }))}
          selected={selectedTags}
          onChange={(values) => setSelectedTags(values)}
          placeholder="タグを選択"
        />
        <Button
          onClick={handleAddTags}
          className="mt-2"
          disabled={selectedMembers.length === 0 || selectedTags.length === 0}
        >
          選択したメンバーにタグを追加
        </Button>
      </div>
    </div>
  );
}
