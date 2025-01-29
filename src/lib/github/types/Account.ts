import { z } from "zod";

export const ZGitHubAccountId = z
  .number()
  .int()
  .positive()
  .brand<"GitHubAccountId">("GitHubAccountId");
export type GitHubAccountId = z.infer<typeof ZGitHubAccountId>;
export const ZGitHubAccount = z.object({
  id: ZGitHubAccountId,
  avatar_url: z.string(),
  login: z.string(),
  html_url: z.string(),
  type: z.string(),
});
