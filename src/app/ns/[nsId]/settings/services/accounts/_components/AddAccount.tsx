"use client";
import { useCreateServiceAccount } from "@/app/ns/[nsId]/settings/services/_hooks/use-create-service-account";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type DiscordCredentials,
  type GithubCredentials,
  type VRChatCredentials,
  ZDiscordCredentials,
  ZGithubCredentials,
  ZVRChatCredentials,
} from "@/types/credentials";
import type { ExternalServiceName } from "@prisma/client";
import { type ChangeEvent, type FC, type FormEvent, useState } from "react";
import { onServiceAccountChange } from "../../_hooks/on-accounts-change";

export type Props = {
  nsId: string;
};

export type ServiceOption = {
  value: ExternalServiceName;
  label: string;
};

export type CredentialInputProps<T> = {
  disabled: boolean;
  credential: T;
  handleCredentialChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const serviceOptions: ServiceOption[] = [
  { value: "DISCORD", label: "Discord" },
  { value: "VRCHAT", label: "VRChat" },
  { value: "GITHUB", label: "GitHub" },
];

const DiscordCredentialsInput: FC<CredentialInputProps<DiscordCredentials>> = ({
  credential,
  handleCredentialChange,
  disabled,
}) => (
  <FormItem>
    <Input
      type="text"
      name="token"
      value={credential.token}
      onChange={handleCredentialChange}
      placeholder="Bot Token"
      required
      disabled={disabled}
    />
  </FormItem>
);

const VRChatCredentialsInput: FC<CredentialInputProps<VRChatCredentials>> = ({
  credential,
  handleCredentialChange,
  disabled,
}) => (
  <>
    <FormItem>
      <Input
        type="text"
        name="username"
        value={credential.username}
        onChange={handleCredentialChange}
        placeholder="Username"
        required
        disabled={disabled}
      />
    </FormItem>
    <FormItem>
      <Input
        type="password"
        name="password"
        value={credential.password}
        onChange={handleCredentialChange}
        placeholder="Password"
        required
        disabled={disabled}
      />
    </FormItem>
    <FormItem>
      <Input
        type="text"
        name="totp"
        value={credential.totp}
        onChange={handleCredentialChange}
        placeholder="TOTP"
        required
        disabled={disabled}
      />
    </FormItem>
  </>
);

const GithubCredentialsInput: FC<CredentialInputProps<GithubCredentials>> = ({
  credential,
  handleCredentialChange,
  disabled,
}) => (
  <FormItem>
    <Input
      type="text"
      name="token"
      value={credential.token}
      onChange={handleCredentialChange}
      placeholder="GitHub App Token"
      required
      disabled={disabled}
    />
  </FormItem>
);

export const AddAccount: FC<Props> = ({ nsId }) => {
  const [name, setName] = useState("");
  const [service, setService] = useState<ExternalServiceName>(
    serviceOptions[0].value,
  );
  const [credential, setCredential] = useState({
    token: "",
    username: "",
    password: "",
    totp: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { createServiceAccount, loading } = useCreateServiceAccount();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const credentialString = (() => {
      switch (service) {
        case "DISCORD": {
          const data = ZDiscordCredentials.strip().parse(credential);
          return JSON.stringify(data);
        }
        case "VRCHAT": {
          const data = ZVRChatCredentials.strip().parse(credential);
          return JSON.stringify(data);
        }
        case "GITHUB": {
          const data = ZGithubCredentials.strip().parse(credential);
          return JSON.stringify(data);
        }
        default:
          throw new Error("Invalid service");
      }
    })();

    const result = await createServiceAccount(nsId, {
      name,
      service,
      credential: credentialString,
    });

    if (result.status === "error") {
      setError(result.error);
    } else {
      onServiceAccountChange();
      setSuccess("Service account created successfully");
      setName("");
      setService(serviceOptions[0].value);
      setCredential({ token: "", username: "", password: "", totp: "" });
    }
  };

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <FormItem>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          placeholder="表示名"
        />
      </FormItem>
      <FormItem>
        <Select
          value={service}
          onValueChange={(value) => setService(value as ExternalServiceName)}
          disabled={loading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="サービス" />
          </SelectTrigger>
          <SelectContent>
            {serviceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
      {service === "DISCORD" && (
        <DiscordCredentialsInput
          credential={credential}
          handleCredentialChange={handleCredentialChange}
          disabled={loading}
        />
      )}
      {service === "VRCHAT" && (
        <VRChatCredentialsInput
          credential={credential}
          handleCredentialChange={handleCredentialChange}
          disabled={loading}
        />
      )}
      {service === "GITHUB" && (
        <GithubCredentialsInput
          credential={credential}
          handleCredentialChange={handleCredentialChange}
          disabled={loading}
        />
      )}
      <Button type="submit" disabled={loading}>
        認証情報を追加
      </Button>
      {error && <Alert>{error}</Alert>}
      {success && <Alert>{success}</Alert>}
    </form>
  );
};
