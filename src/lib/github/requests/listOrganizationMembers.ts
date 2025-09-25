import { z } from "zod";
import { filterObject } from "@/lib/filterObject";
import { requests } from "@/lib/requests";
import { githubLimit } from "../plimit";
import type { GitHubInstallationAccessToken } from "../types/AccessToken";
import {
  type GitHubAccount,
  type GitHubOrganizationId,
  ZGitHubAccount,
} from "../types/Account";

type Options = {
  per_page?: number;
  page?: number;
};

export const listOrganizationMembers = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
  options: Options = {},
): Promise<GitHubAccount[]> => {
  const query = new URLSearchParams(
    filterObject({
      per_page: options.per_page?.toString(),
      page: options.page?.toString(),
    } as Record<string, string>),
  );
  const response = await githubLimit(() =>
    requests(
      `https://api.github.com/orgs/${organizationId}/members?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    ),
  );
  if (!response.ok) {
    throw new Error(`Failed to list members: ${response.statusText}`);
  }
  const data = z.array(ZGitHubAccount).safeParse(await response.json());
  if (!data.success) {
    throw new Error("Failed to parse response");
  }
  return data.data;
};
