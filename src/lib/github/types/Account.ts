import { z } from "zod";
import { ZGitHubAppInstallationId } from "./AppInstallation";

export const ZGitHubAccountId = z
  .number()
  .int()
  .positive()
  .brand<"GitHubAccountId">("GitHubAccountId");
export type GitHubAccountId = z.infer<typeof ZGitHubAccountId>;

export const ZGitHubAccountUsername = z
  .string()
  .nonempty()
  .brand<"GitHubAccountUsername">("GitHubAccountUsername");
export type GitHubAccountUsername = z.infer<typeof ZGitHubAccountUsername>;

export const ZGitHubOrganizationId = z
  .string()
  .nonempty()
  .brand<"GitHubOrganizationId">("GitHubOrganizationId");
export type GitHubOrganizationId = z.infer<typeof ZGitHubOrganizationId>;

export const ZGitHubLogin = z.union([
  ZGitHubAccountUsername,
  ZGitHubOrganizationId,
]);
export type GitHubLogin = z.infer<typeof ZGitHubLogin>;

export const ZGitHubAccount = z.object({
  id: ZGitHubAccountId,
  avatar_url: z.string(),
  login: ZGitHubLogin,
  name: z.string().nullable().optional(),
  html_url: z.string(),
  type: z.string(),
});
export type GitHubAccount = z.infer<typeof ZGitHubAccount>;
