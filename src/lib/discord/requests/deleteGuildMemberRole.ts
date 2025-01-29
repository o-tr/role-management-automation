import { requests } from "@/lib/requests";
import { discordLimit } from "../plimit";
import type { DiscordGuildId, DiscordGuildRoleId } from "../types/guild";
import type { DiscordToken } from "../types/token";
import type { DiscordUserId } from "../types/user";

export const deleteGuildMemberRole = async (
  token: DiscordToken,
  guildId: DiscordGuildId,
  userId: DiscordUserId,
  roleId: DiscordGuildRoleId,
): Promise<void> => {
  const response = await discordLimit(() =>
    requests(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "DELETE",
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
