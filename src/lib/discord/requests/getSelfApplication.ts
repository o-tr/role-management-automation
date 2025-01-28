import { DISCORD_USER_AGENT } from "../const";
import { discordLimit } from "../plimit";
import { ZDiscordApplicaton } from "../types/application";
import type { DiscordToken } from "../types/token";

export const getSelfApplication = async (token: DiscordToken) => {
  const response = await discordLimit(() =>
    fetch("https://discord.com/api/v10/applications/@me", {
      headers: {
        Authorization: `Bot ${token}`,
        UserAgent: DISCORD_USER_AGENT,
      },
    }),
  );
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
