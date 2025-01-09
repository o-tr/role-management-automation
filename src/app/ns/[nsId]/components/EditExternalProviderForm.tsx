"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalProvider } from "@prisma/client";
import { updateExternalProvider } from "../../actions";
import { GroupId } from "@/types/brandTypes";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TExternalProvider = ExternalProvider & { groupId: GroupId };

interface EditExternalProviderFormProps {
  provider: TExternalProvider;
}

export function EditExternalProviderForm({
  provider,
}: EditExternalProviderFormProps) {
  const { handleSubmit, control, watch, reset } = useForm({
    defaultValues: {
      name: provider.name,
      provider: provider.provider,
      providerId: provider.providerId,
      credentials: JSON.parse(provider.authorization || "{}"),
    },
  });

  const providerType = watch("provider");

  const onSubmit = async (data: any) => {
    await updateExternalProvider(provider.groupId, provider.id, {
      ...data,
      credentials: JSON.stringify(data.credentials),
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={"space-y-2"}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input {...field} placeholder="表示名" required />
        )}
      />
      <Controller
        name="provider"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            onValueChange={(value) => field.onChange(value)}
            required
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="プロバイダー" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DISCORD">Discord</SelectItem>
              <SelectItem value="VRCHAT">VRChat</SelectItem>
              <SelectItem value="GITHUB">GitHub</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <Controller
        name="providerId"
        control={control}
        render={({ field }) => (
          <Input {...field} placeholder="プロバイダーID" required />
        )}
      />
      {(providerType === "DISCORD" ||
        providerType === "GITHUB" ||
        providerType === "VRCHAT") && (
        <div className={"space-y-2"}>
          <h3 className="text-lg">認証情報</h3>
          {providerType === "DISCORD" && (
            <>
              <Controller
                name="credentials.applicationId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={"flex-1"}
                    placeholder="Application ID"
                    required
                  />
                )}
              />
              <Controller
                name="credentials.token"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={"flex-1"}
                    placeholder="Token"
                    required
                  />
                )}
              />
            </>
          )}
          {providerType === "GITHUB" && (
            <Controller
              name="credentials.pat"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className={"flex-1"}
                  placeholder="PAT"
                  required
                />
              )}
            />
          )}
          {providerType === "VRCHAT" && (
            <>
              <Controller
                name="credentials.email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={"flex-1"}
                    placeholder="Email"
                    required
                  />
                )}
              />
              <Controller
                name="credentials.password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={"flex-1"}
                    placeholder="Password"
                    type="password"
                    required
                  />
                )}
              />
              <Controller
                name="credentials.totp"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={"flex-1"}
                    placeholder="TOTP"
                    required
                  />
                )}
              />
            </>
          )}
        </div>
      )}
      <Button type="submit">更新</Button>
    </form>
  );
}
