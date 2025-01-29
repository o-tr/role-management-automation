import jwt from "jsonwebtoken";
import type { GitHubAppClientId, GitHubAppClientSecret } from "./types/app";
import type { GitHubJWTToken } from "./types/auth";

export const generateJWT = (
  clientId: GitHubAppClientId,
  privateKey: GitHubAppClientSecret,
): GitHubJWTToken => {
  const payload = {
    iat: Math.floor(Date.now() / 1000) - 60,
    exp: Math.floor(Date.now() / 1000) + 60 * 10,
    iss: clientId,
  };
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return token as GitHubJWTToken;
};
