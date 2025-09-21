import { SignJWT, importPKCS8 } from "jose";
import type { GitHubAppClientId, GitHubAppClientSecret } from "./types/app";
import type { GitHubJWTToken } from "./types/auth";

export const generateJWT = async (
  clientId: GitHubAppClientId,
  privateKey: GitHubAppClientSecret,
): Promise<GitHubJWTToken> => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 10;

  // RS256用の秘密鍵をCryptoKeyオブジェクトとしてインポート
  const cryptoKey = await importPKCS8(privateKey, "RS256");

  const token = await new SignJWT({
    iss: clientId,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 60)
    .setExpirationTime(exp)
    .sign(cryptoKey);

  return token as GitHubJWTToken;
};
