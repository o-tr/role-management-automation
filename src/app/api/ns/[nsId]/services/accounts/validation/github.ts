import { generateJWT } from "@/lib/github/generateJWT";
import { getAuthenticatedApp } from "@/lib/github/requests/getAuthenticatedApp";
import { ZGithubCredentials } from "@/types/credentials";

export const isValidGithubCredential = async (
  credential: string,
): Promise<
  | {
      credential: string;
      icon?: string;
    }
  | undefined
> => {
  const { clientId, privateKey } = ZGithubCredentials.parse(
    JSON.parse(credential),
  );
  const jwt = generateJWT(clientId, privateKey);
  const app = await getAuthenticatedApp(jwt);
  return {
    credential: JSON.stringify({ clientId, privateKey }),
    icon: `https://avatars.githubusercontent.com/in/${app.id}?v=4`,
  };
};
