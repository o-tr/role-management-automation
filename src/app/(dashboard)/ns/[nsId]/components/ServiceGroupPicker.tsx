import type { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TAvailableGroup } from "@/types/prisma";
import { ServiceGroupDisplay } from "./ServiceGroupDisplay";

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
            <SelectItem key={group.id} value={`${group.id}`}>
              <ServiceGroupDisplay group={group} />
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
