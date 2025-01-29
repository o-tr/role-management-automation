import { githubLimit } from "../plimit";
import {
  type GitHubAppInstallationId,
  ZGitHubAppInstallation,
} from "../types/AppInstallation";
import type { GitHubJWTToken } from "../types/auth";

export const getInstallationForAuthenticatedApp = async (
  token: GitHubJWTToken,
  installationId: GitHubAppInstallationId,
) => {
  const response = await githubLimit(() =>
    fetch(`https://api.github.com/app/installations/${installationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch self application: ${response.statusText}`);
  }
  const parsed = ZGitHubAppInstallation.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Failed to parse response");
  }
  return parsed.data;
};
