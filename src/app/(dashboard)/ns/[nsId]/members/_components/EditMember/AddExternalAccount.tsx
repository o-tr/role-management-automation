import type {
  ResolveResult,
  TResolveRequestType,
} from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TMemberExternalServiceAccountId,
  TMemberWithRelation,
} from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { MemberAccountResolveDisplay } from "../../../components/MemberAccountResolveDisplay";

export const AddExternalAccount: FC<{
  member: TMemberWithRelation;
  setMember: Dispatch<SetStateAction<TMemberWithRelation>>;
  disabled: boolean;
}> = ({ member, setMember, disabled }) => {
  const [addAccountService, setAddAccountService] =
    useState<TResolveRequestType>("VRCUserId");
  const [addAccountValue, setAddAccountValue] = useState("");

  const usedServices = member.externalAccounts.map((a) => a.service);
  const availableServices = (
    ["VRCHAT", "DISCORD", "GITHUB"] as ExternalServiceName[]
  ).filter((s) => !usedServices.includes(s));

  const onConfirm = (data: ResolveResult) => {
    setMember((pv) => {
      const nv = structuredClone(pv);
      nv.externalAccounts.push({
        id: crypto.randomUUID() as TMemberExternalServiceAccountId,
        service: data.service,
        serviceId: data.serviceId,
        name: data.name,
        icon: data.icon || undefined,
        status: "ACTIVE",
        namespaceId: member.namespaceId,
        memberId: member.id,
      });
      return nv;
    });
    setAddAccountService("VRCUserId");
    setAddAccountValue("");
  };

  return (
    <div>
      {!addAccountValue && (
        <AddExternalAccountInput
          availableServices={availableServices}
          onConfirm={(service, value) => {
            setAddAccountService(service);
            setAddAccountValue(value);
          }}
          disabled={disabled}
        />
      )}
      {addAccountValue && (
        <AddExternalAccountPreview
          nsId={member.namespaceId}
          service={addAccountService}
          value={addAccountValue}
          onConfirm={onConfirm}
          onCancel={() => {
            setAddAccountService("VRCUserId");
            setAddAccountValue("");
          }}
          disabled={disabled}
        />
      )}
    </div>
  );
};

const AddExternalAccountPreview: FC<{
  nsId: string;
  service: TResolveRequestType;
  value: string;
  onConfirm: (data: ResolveResult) => void;
  onCancel: () => void;
  disabled: boolean;
}> = ({ service, value, onConfirm, onCancel, nsId, disabled }) => {
  const [result, setResult] = useState<ResolveResult | null>(null);
  const onConfirmClick = () => {
    if (!result) return;
    onConfirm(result);
  };
  return (
    <div className="flex flex-row items-center gap-2">
      <MemberAccountResolveDisplay
        nsId={nsId}
        type={service}
        serviceId={value}
        onResolve={setResult}
      />
      <Button onClick={onConfirmClick} disabled={!result || disabled}>
        追加
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={disabled}>
        キャンセル
      </Button>
    </div>
  );
};

const KeyLabelMap = {
  VRCUserId: "VRChat ID",
  DiscordUserId: "Discord ID",
  DiscordUsername: "Discord ユーザー名",
  GitHubUserId: "GitHub ID",
  GitHubUsername: "GitHub ユーザー名",
} as { [key in TResolveRequestType]: string };

const AddExternalAccountInput: FC<{
  availableServices: ExternalServiceName[];
  onConfirm: (service: TResolveRequestType, value: string) => void;
  disabled: boolean;
}> = ({ onConfirm, availableServices, disabled }) => {
  const [addAccountService, setAddAccountService] =
    useState<TResolveRequestType>("VRCUserId");
  const [addAccountValue, setAddAccountValue] = useState("");

  const availableResolveOprions = (
    [
      availableServices.includes("VRCHAT") ? ["VRCUserId"] : [],
      availableServices.includes("DISCORD")
        ? ["DiscordUserId", "DiscordUsername"]
        : [],
      availableServices.includes("GITHUB")
        ? ["GitHubUserId", "GitHubUsername"]
        : [],
    ] as TResolveRequestType[][]
  ).flat();

  useEffect(() => {
    if (!availableResolveOprions.includes(addAccountService)) {
      setAddAccountService(availableResolveOprions[0]);
    }
  }, [availableResolveOprions, addAccountService]);

  const onConfirmClick = () => {
    onConfirm(addAccountService, addAccountValue);
  };
  if (!availableServices.length) return null;

  return (
    <div className="flex flex-row items-center gap-2">
      <Select
        value={addAccountService}
        onValueChange={(v) => setAddAccountService(v as TResolveRequestType)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="プロバイダー" />
        </SelectTrigger>
        <SelectContent>
          {availableResolveOprions.map((key) => (
            <SelectItem key={key} value={key}>
              {KeyLabelMap[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        disabled={!addAccountService || disabled}
        value={addAccountValue}
        onChange={(e) => setAddAccountValue(e.target.value)}
        placeholder="ID"
      />
      <Button onClick={onConfirmClick} disabled={disabled}>
        確認
      </Button>
    </div>
  );
};
