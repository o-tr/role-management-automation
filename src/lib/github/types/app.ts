import { z } from "zod";

export const ZGitHubAppId = z
  .number()
  .int()
  .positive()
  .brand<"GitHubAppId">("GitHubAppId");
export type GitHubAppId = z.infer<typeof ZGitHubAppId>;
export const ZGitHubAppClientId = z
  .string()
  .nonempty()
  .brand<"GitHubAppClientId">("GitHubAppClientId");
export type GitHubAppClientId = z.infer<typeof ZGitHubAppClientId>;
export const ZGitHubAppClientSecret = z
  .string()
  .nonempty()
  .brand<"GitHubAppClientSecret">("GitHubAppClientSecret");
export type GitHubAppClientSecret = z.infer<typeof ZGitHubAppClientSecret>;
