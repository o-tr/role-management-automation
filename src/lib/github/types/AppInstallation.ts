import { z } from "zod";
import { ZGitHubAccount } from "./Account";
import { ZGitHubAppClientId } from "./app";

export const ZGitHubAppInstallationId = z
  .number()
  .int()
  .positive()
  .brand<"GitHubAppInstallationId">("GitHubAppInstallationId");
export type GitHubAppInstallationId = z.infer<typeof ZGitHubAppInstallationId>;

export const ZGitHubAppInstallation = z.object({
  id: ZGitHubAppInstallationId,
  client_id: ZGitHubAppClientId,
  account: ZGitHubAccount,
  access_tokens_url: z.string(),
});
export type GitHubAppInstallation = z.infer<typeof ZGitHubAppInstallation>;
