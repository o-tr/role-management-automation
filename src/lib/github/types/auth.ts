import { z } from "zod";

export const ZGitHubJWTToken = z
  .string()
  .nonempty()
  .brand<"GitHubJWTToken">("GitHubJWTToken");
export type GitHubJWTToken = z.infer<typeof ZGitHubJWTToken>;
