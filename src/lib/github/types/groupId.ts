import { z } from "zod";
import { ZGitHubLogin } from "./Account";
import { ZGitHubAppInstallationId } from "./AppInstallation";

export const ZGitHubGroupId = z.object({
  installationId: ZGitHubAppInstallationId,
  accountId: ZGitHubLogin,
});
export type GitHubGroupId = z.infer<typeof ZGitHubGroupId>;
