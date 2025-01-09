import { getSelfApplication } from "./requests/getSelfApplication";

export const isValidBotToken = async (token: string) => {
  try {
    const app = await getSelfApplication(token);
    return app.id !== undefined;
  } catch (e) {
    return false;
  }
};
