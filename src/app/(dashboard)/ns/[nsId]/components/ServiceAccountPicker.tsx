import type { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FExternalServiceAccount } from "@/types/prisma";
import { ServiceAccountDisplay } from "./ServiceAccountDisplay";

type Props = {
  accounts: FExternalServiceAccount[];
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
            <ServiceAccountDisplay account={account} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
