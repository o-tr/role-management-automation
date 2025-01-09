const getAuthToken = (cookies: string[]) => {
  for (const cookie of cookies) {
    const [key, value] = cookie.split(";")[0].split("=");
    if (key === "auth") {
      return value;
    }
  }
  return "";
};

const getTwoFactorAuthToken = (cookies: string[]) => {
  for (const cookie of cookies) {
    const [key, value] = cookie.split(";")[0].split("=");
    if (key === "twoFactorAuth") {
      return value;
    }
  }
  return "";
};

const buildCookie = ({
  token,
  twoFactorAuth,
}: { token?: string; twoFactorAuth?: string }) => {
  const result: string[] = [];
  if (token) result.push(`auth=${token}`);
  if (twoFactorAuth) result.push(`twoFactorAuth=${twoFactorAuth}`);
  return result.join("; ");
};

export { buildCookie, getAuthToken, getTwoFactorAuthToken };
