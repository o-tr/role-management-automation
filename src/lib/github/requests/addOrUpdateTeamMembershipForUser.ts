import { requests } from "@/lib/requests";
import { githubLimit } from "../plimit";
import type { GitHubInstallationAccessToken } from "../types/AccessToken";
import type {
  GitHubAccountUsername,
  GitHubOrganizationId,
} from "../types/Account";
import type { GitHubTeamSlug } from "../types/Team";
import {
  type GitHubTeamMembership,
  ZGitHubTeamMembership,
} from "../types/TeamMembership";

export const addOrUpdateTeammembershipForUser = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
  team_slug: GitHubTeamSlug,
  username: GitHubAccountUsername,
): Promise<GitHubTeamMembership> => {
  const response = await githubLimit(() =>
    requests(
      `https://api.github.com/orgs/${organizationId}/teams/${team_slug}/memberships/${username}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ role: "maintainer" }),
      },
    ),
  );
  if (!response.ok) {
    throw new Error();
  }
  const data = ZGitHubTeamMembership.safeParse(await response.json());
  if (!data.success) {
    throw new Error("Failed to parse response");
  }

  return data.data;
};
