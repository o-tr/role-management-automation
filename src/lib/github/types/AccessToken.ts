import { z } from "zod";

export const ZGitHubInstallationAccessToken = z
  .string()
  .nonempty()
  .startsWith("ghs_")
  .brand<"GitHubInstallationAccessToken">("GitHubInstallationAccessToken");
export type GitHubInstallationAccessToken = z.infer<
  typeof ZGitHubInstallationAccessToken
>;

export const ZGitHubInstallationAccess = z.object({
  token: ZGitHubInstallationAccessToken,
  expires_at: z.string().transform((v) => new Date(v)),
});
export type GitHubInstallationAccess = z.infer<
  typeof ZGitHubInstallationAccess
>;
