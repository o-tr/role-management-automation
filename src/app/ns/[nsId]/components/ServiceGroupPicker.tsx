import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TAvailableGroup } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  groups: TAvailableGroup[];
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const ServiceGroupPicker: FC<Props> = ({
  groups,
  disabled,
  value,
  onChange,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="グループ" />
      </SelectTrigger>
      <SelectContent>
        {disabled ? (
          <SelectItem value="tmp" disabled>
            Loading...
          </SelectItem>
        ) : (
          groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              <div className="flex flex-row items-center">
                {group.icon && (
                  <img
                    src={group.icon}
                    alt={group.name}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                )}
                <span className="truncate">{group.name}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
