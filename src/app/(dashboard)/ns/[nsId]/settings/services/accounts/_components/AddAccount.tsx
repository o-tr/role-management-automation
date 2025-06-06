"use client";
import { useCreateServiceAccount } from "@/app/(dashboard)/ns/[nsId]/settings/services/_hooks/use-create-service-account";
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
import { Textarea } from "@/components/ui/textarea";
import type { DiscordToken } from "@/lib/discord/types/token";
import type {
  GitHubAppClientId,
  GitHubAppClientSecret,
} from "@/lib/github/types/app";
import {
  type DiscordCredentials,
  type GithubCredentials,
  type VRChatCredentialsInput as VRChatCredentials,
  ZDiscordCredentials,
  ZGithubCredentials,
  ZVRChatCredentialsInput,
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
  handleCredentialChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
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
      name="clientId"
      value={credential.clientId}
      onChange={handleCredentialChange}
      placeholder="GitHub App Client ID"
      required
      disabled={disabled}
    />
    <Textarea
      name="privateKey"
      value={credential.privateKey}
      onChange={handleCredentialChange}
      placeholder="GitHub App Private Key"
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
  const [credential, setCredential] = useState<{
    token: DiscordToken | string;
    username: string;
    password: string;
    totp: string;
    clientId: GitHubAppClientId | string;
    privateKey: GitHubAppClientSecret | string;
  }>({
    token: "",
    username: "",
    password: "",
    totp: "",
    clientId: "",
    privateKey: "",
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
          const data = ZVRChatCredentialsInput.strip().parse(credential);
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
      setCredential({
        token: "",
        username: "",
        password: "",
        totp: "",
        clientId: "",
        privateKey: "",
      });
    }
  };

  const handleCredentialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
          credential={{
            token: credential.token as DiscordToken,
          }}
          handleCredentialChange={handleCredentialChange}
          disabled={loading}
        />
      )}
      {service === "VRCHAT" && (
        <VRChatCredentialsInput
          credential={{
            username: credential.username,
            password: credential.password,
            totp: credential.totp,
          }}
          handleCredentialChange={handleCredentialChange}
          disabled={loading}
        />
      )}
      {service === "GITHUB" && (
        <GithubCredentialsInput
          credential={{
            clientId: credential.clientId as GitHubAppClientId,
            privateKey: credential.privateKey as GitHubAppClientSecret,
          }}
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
