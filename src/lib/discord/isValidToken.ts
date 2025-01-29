import { getSelfApplication } from "./requests/getSelfApplication";
import type { DiscordToken } from "./types/token";

export const isValidBotToken = async (token: DiscordToken) => {
  try {
    const app = await getSelfApplication(token);
    return app.id !== undefined;
  } catch (e) {
    return false;
  }
};
