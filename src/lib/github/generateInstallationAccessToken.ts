import { styleText } from "util";
import { ZGithubCredentials } from "@/types/credentials";
import type {
  TExternalServiceAccount,
  TExternalServiceAccountId,
} from "@/types/prisma";
import { generateJWT } from "./generateJWT";
import { createInstallationAccessTokenForApp } from "./requests/createInstallationAccessTokenForApp";
import type { GitHubInstallationAccessToken } from "./types/AccessToken";
import type { GitHubAppInstallationId } from "./types/AppInstallation";

const tokenCache: {
  serviceAccountId: TExternalServiceAccountId;
  installationId: GitHubAppInstallationId;
  token: GitHubInstallationAccessToken;
  expires_at: Date;
}[] = [];

const TOKEN_EXPIRATION_MARGIN = 60 * 1000;

export const generateInstallationAccessToken = async (
  serviceAccount: TExternalServiceAccount,
  installationId: GitHubAppInstallationId,
): Promise<GitHubInstallationAccessToken> => {
  const cachedToken = tokenCache.find((t) => {
    return (
      t.serviceAccountId === serviceAccount.id &&
      t.installationId === installationId &&
      t.expires_at.getTime() > Date.now() + TOKEN_EXPIRATION_MARGIN
    );
  });
  if (cachedToken) {
    console.log(styleText("green", "Using cached token"));
    return cachedToken.token;
  }
  const credentials = ZGithubCredentials.safeParse(
    JSON.parse(serviceAccount.credential),
  );
  if (!credentials.success) {
    throw new Error("Failed to parse credentials");
  }
  const jwt = generateJWT(
    credentials.data.clientId,
    credentials.data.privateKey,
  );
  const { token, expires_at } = await createInstallationAccessTokenForApp(
    jwt,
    installationId,
  );
  tokenCache.push({
    serviceAccountId: serviceAccount.id,
    installationId,
    token,
    expires_at,
  });
  return token;
};
