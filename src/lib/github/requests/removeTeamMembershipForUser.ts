import { requests } from "@/lib/requests";
import { githubLimit } from "../plimit";
import type { GitHubInstallationAccessToken } from "../types/AccessToken";
import type {
  GitHubAccountUsername,
  GitHubOrganizationId,
} from "../types/Account";
import type { GitHubTeamSlug } from "../types/Team";

export const removeTeamMembershipForUser = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
  team_slug: GitHubTeamSlug,
  username: GitHubAccountUsername,
) => {
  const response = await githubLimit(() =>
    requests(
      `https://api.github.com/orgs/${organizationId}/teams/${team_slug}/memberships/${username}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    ),
  );
  if (!response.ok || response.status !== 204) {
    console.error(response);
    throw new Error("Failed to remove user from team");
  }
  return;
};
