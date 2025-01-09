"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupSelectorProps {
  groups: { id: number; name: string }[];
  selectedGroupId: number;
}

export default function GroupSelector({
  groups,
  selectedGroupId,
}: GroupSelectorProps) {
  const router = useRouter();

  const handleGroupChange = (groupId: string) => {
    router.push(`/?groupId=${groupId}`);
  };

  return (
    <div className="mb-4">
      <Select
        defaultValue={selectedGroupId.toString()}
        onValueChange={handleGroupChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="グループを選択" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id.toString()}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
