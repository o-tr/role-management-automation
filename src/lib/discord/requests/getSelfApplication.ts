import { DISCORD_USER_AGENT } from "../const";
import { ZDiscordApplicaton } from "../types/application";

export const getSelfApplication = async (token: string) => {
  const response = await fetch("https://discord.com/api/v10/applications/@me", {
    headers: {
      Authorization: `Bot ${token}`,
      UserAgent: DISCORD_USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch self application: ${response.statusText}`);
  }
  const data = ZDiscordApplicaton.safeParse(await response.json());
  if (!data.success) {
    throw new Error(
      `Failed to parse self application: ${JSON.stringify(data.error)}`,
    );
  }

  return data.data;
};
