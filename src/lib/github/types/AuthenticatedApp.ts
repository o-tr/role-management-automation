import { z } from "zod";

export const ZGitHubAuthenticatedApp = z.object({
  id: z.number().int().positive(),
  slug: z.string().nonempty(),
  client_id: z.string().nonempty(),
  node_id: z.string().nonempty(),
  name: z.string(),
  description: z.string(),
});
export type GitHubAuthenticatedApp = z.infer<typeof ZGitHubAuthenticatedApp>;
