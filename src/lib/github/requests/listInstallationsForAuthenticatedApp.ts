import { requests } from "@/lib/requests";
import { z } from "zod";
import { githubLimit } from "../plimit";
import {
  type GitHubAppInstallation,
  ZGitHubAppInstallation,
} from "../types/AppInstallation";
import type { GitHubJWTToken } from "../types/auth";

export const listInstallationsForAuthenticatedApp = async (
  token: GitHubJWTToken,
): Promise<GitHubAppInstallation[]> => {
  const response = await githubLimit(() =>
    requests("https://api.github.com/app/installations", {
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
  const parsed = z
    .array(ZGitHubAppInstallation)
    .safeParse(await response.json());
  if (!parsed.success) {
    console.log(JSON.stringify(parsed.error, null, 2));
    throw new Error("Failed to parse response");
  }
  return parsed.data;
};
