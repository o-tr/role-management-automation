import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC, useMemo } from "react";
import { addExternalProvider } from "@/app/ns/actions";
import { useForm, Controller } from "react-hook-form";
import { GroupId } from "@/types/brandTypes";

type Props = {
  groupId: GroupId;
};

export const AddExternalProviderForm: FC<Props> = ({ groupId }) => {
  const { handleSubmit, control, watch, reset } = useForm({
    defaultValues: {
      label: "",
      provider: "",
      providerId: "",
      credentials: {
        applicationId: "",
        token: "",
        pat: "",
        email: "",
        password: "",
        totp: "",
      },
    },
  });

  const provider = watch("provider");

  const providerIdLabel = useMemo(() => {
    switch (provider) {
      case "DISCORD":
        return "サーバーID";
      case "VRCHAT":
        return "グループID";
      case "GITHUB":
        return "Organization ID";
    }
  }, [provider]);

  const onSubmit = async (data: any) => {
    await addExternalProvider(
      groupId,
      data.provider,
      data.providerId,
      data.label,
      JSON.stringify(data.credentials)
    );
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={"text-lg"}>外部プロバイダーを追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className={"space-y-2"}>
          <Controller
            name="label"
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
          {providerIdLabel && (
            <Controller
              name="providerId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className={"flex-1"}
                  placeholder={providerIdLabel}
                  required
                />
              )}
            />
          )}
          {(provider === "DISCORD" ||
            provider === "GITHUB" ||
            provider === "VRCHAT") && (
            <div className={"space-y-2"}>
              <h3 className="text-lg">認証情報</h3>
              {provider === "DISCORD" && (
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
              {provider === "GITHUB" && (
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
              {provider === "VRCHAT" && (
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
          <Button type="submit">追加</Button>
        </form>
      </CardContent>
    </Card>
  );
};
