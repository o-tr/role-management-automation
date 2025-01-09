import * as speakeasy from "speakeasy";

export const getTotpCode = (secret: string): string => {
  return speakeasy.totp({
    secret: secret.replace(/\s/g, ""),
    encoding: "base32",
  });
};
