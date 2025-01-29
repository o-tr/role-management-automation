import { requests } from "@/lib/requests";
import { githubLimit } from "../plimit";
import {
  type GitHubAuthenticatedApp,
  ZGitHubAuthenticatedApp,
} from "../types/AuthenticatedApp";
import type { GitHubJWTToken } from "../types/auth";

export const getAuthenticatedApp = async (
  token: GitHubJWTToken,
): Promise<GitHubAuthenticatedApp> => {
  const response = await githubLimit(() =>
    requests("https://api.github.com/app", {
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
  const data = await response.json();
  console.log(data);
  const parsed = ZGitHubAuthenticatedApp.safeParse(data);
  if (!parsed.success) {
    throw new Error("Failed to parse response");
  }
  return parsed.data;
};
