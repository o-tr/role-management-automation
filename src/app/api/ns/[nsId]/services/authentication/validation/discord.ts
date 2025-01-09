import { getSelfApplication } from "@/lib/discord/requests/getSelfApplication";
import { ZDiscordCredentials } from "@/types/credentials";

export const isValidBotToken = async (credential: string) => {
  try{
    const data = ZDiscordCredentials.parse(JSON.parse(credential));
    const token = data.token;
    const app = await getSelfApplication(token);
    return app.id !== undefined;
  }
  catch (e) {
    return false;
  }
}