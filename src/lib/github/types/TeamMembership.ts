import { z } from "zod";

export const ZGitHubTeamMembership = z.object({
  url: z.string(),
  role: z.string(),
  state: z.enum(["active", "pending"]),
});
export type GitHubTeamMembership = z.infer<typeof ZGitHubTeamMembership>;
