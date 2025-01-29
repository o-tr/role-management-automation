import { requests } from "@/lib/requests";
import { githubLimit } from "../plimit";
import type { GitHubInstallationAccessToken } from "../types/AccessToken";
import {
  type GitHubAccount,
  type GitHubAccountUsername,
  ZGitHubAccount,
} from "../types/Account";

export const getUserByUsername = async (
  token: GitHubInstallationAccessToken,
  id: GitHubAccountUsername,
): Promise<GitHubAccount> => {
  const response = await githubLimit(() =>
    requests(`https://api.github.com/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }),
  );
  if (!response.ok) {
    console.log(await response.json());
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  const user = ZGitHubAccount.safeParse(await response.json());
  if (!user.success) {
    console.log(user.error);
    throw new Error("Failed to parse response");
  }
  return user.data;
};
