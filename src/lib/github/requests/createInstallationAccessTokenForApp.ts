import { requests } from "@/lib/requests";
import { githubLimit } from "../plimit";
import {
  type GitHubInstallationAccess,
  ZGitHubInstallationAccess,
} from "../types/AccessToken";
import type { GitHubAppInstallationId } from "../types/AppInstallation";
import type { GitHubJWTToken } from "../types/auth";

export const createInstallationAccessTokenForApp = async (
  jwt: GitHubJWTToken,
  installationId: GitHubAppInstallationId,
): Promise<GitHubInstallationAccess> => {
  const response = await githubLimit(() =>
    requests(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          permissions: {
            members: "write",
          },
        }),
      },
    ),
  );
  if (!response.ok) {
    throw new Error(
      `Failed to create installation access token for app: ${response.statusText}`,
    );
  }
  const data = ZGitHubInstallationAccess.safeParse(await response.json());
  if (!data.success) {
    throw new Error("Failed to parse response");
  }

  return data.data;
};
