import { discordLimit } from "../plimit";
import { ZDiscordGuildList } from "../types/application";
import type { DiscordGuildId, DiscordGuildRoleId } from "../types/guild";
import type { DiscordToken } from "../types/token";
import type { DiscordUserId } from "../types/user";

export const addGuildMemberRole = async (
  token: DiscordToken,
  guildId: DiscordGuildId,
  userId: DiscordUserId,
  roleId: DiscordGuildRoleId,
): Promise<void> => {
  const response = await discordLimit(() =>
    fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${token}`,
        },
      },
    ),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch self application: ${response.statusText}`);
  }
  return;
};
