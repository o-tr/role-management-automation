import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TServiceAccount } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  accounts: TServiceAccount[];
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const ServiceAccountPicker: FC<Props> = ({
  accounts,
  onChange,
  value,
  disabled,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="アカウント" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex flex-row items-center">
              {account.icon && (
                <img
                  src={account.icon}
                  alt={account.name}
                  className="w-6 h-6 mr-2 rounded-full"
                />
              )}
              <span className="truncate">{`${account.name} (${account.service})`}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
