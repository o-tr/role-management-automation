import { VRCHAT_USER_AGENT } from "../const"
import { buildCookie } from "../cookie"
import { VRCAuth, ZVRCAuth } from "../types/Auth"

export const getAuth = async(token: string, twoFactorAuth: string): Promise<VRCAuth> => {
  const request = await fetch("https://vrchat.com/api/1/auth", {
    headers: {
      "User-Agent": VRCHAT_USER_AGENT,
      "Cookie": buildCookie({token, twoFactorAuth})
    }
  })
  if (!request.ok) {
    throw new Error(`Failed to validate token: ${request.statusText}`)
  }
  const data = ZVRCAuth.safeParse(await request.json())
  if (!data.success) {
    throw new Error(`Failed to validate token: ${JSON.stringify(data)}`)
  }
  console.log(data.data)
  return data.data;
}
