import { discordLimit } from "../plimit";
import { ZDiscordUser } from "../types/user";

export const getUser = async (token: string, userId: string) => {
  const response = await discordLimit(() =>
    fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }),
  );
  if (!response.ok) {
    throw new Error(`Failed to get guild: ${response.statusText}`);
  }
  const data = ZDiscordUser.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse guild: ${data.error}`);
  }
  return data.data;
};
