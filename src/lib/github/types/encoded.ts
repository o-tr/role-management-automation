import { z } from "zod";
import { ZGitHubLogin } from "./Account";
import { ZGitHubAppInstallationId } from "./AppInstallation";
import { ZGitHubTeamId, ZGitHubTeamSlug } from "./Team";

export const ZGitHubGroupId = z.object({
  installationId: ZGitHubAppInstallationId,
  accountId: ZGitHubLogin,
});
export type GitHubGroupId = z.infer<typeof ZGitHubGroupId>;

export const ZGitHubRoleId = z.object({
  teamId: ZGitHubTeamId,
  teamSlug: ZGitHubTeamSlug,
});
export type GitHubRoleId = z.infer<typeof ZGitHubRoleId>;
