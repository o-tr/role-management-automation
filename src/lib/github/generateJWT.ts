import { SignJWT } from "jose";
import type { GitHubAppClientId, GitHubAppClientSecret } from "./types/app";
import type { GitHubJWTToken } from "./types/auth";

export const generateJWT = async (
  clientId: GitHubAppClientId,
  privateKey: GitHubAppClientSecret,
): Promise<GitHubJWTToken> => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 60 * 10,
    iss: clientId,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .sign(new TextEncoder().encode(privateKey));

  return token as GitHubJWTToken;
};
