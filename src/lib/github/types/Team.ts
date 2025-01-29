import { z } from "zod";

export const ZGitHubTeamId = z
  .number()
  .int()
  .positive()
  .brand<"GitHubTeamId">("GitHubTeamId");
export type GitHubTeamId = z.infer<typeof ZGitHubTeamId>;

export const ZGitHubTeamSlug = z
  .string()
  .nonempty()
  .brand<"GitHubTeamSlug">("GitHubTeamSlug");
export type GitHubTeamSlug = z.infer<typeof ZGitHubTeamSlug>;

export const ZGitHubTeam = z.object({
  id: ZGitHubTeamId,
  name: z.string(),
  slug: ZGitHubTeamSlug,
});
export type GitHubTeam = z.infer<typeof ZGitHubTeam>;
