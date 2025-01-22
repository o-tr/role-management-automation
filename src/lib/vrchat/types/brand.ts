import { z } from "zod";

export const ZVRCUserId = z
  .string()
  .regex(
    /^(?:https?:\/\/vrchat\.com\/home\/user\/)?usr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  )
  .transform((val) => val.replace(/https?:\/\/vrchat\.com\/home\/user\//, ""))
  .brand<"VRCUserId">("VRCUserId");
export type VRCUserId = z.infer<typeof ZVRCUserId>;

export const ZVRCToken = z.string().brand<"VRCToken">("VRCToken");
export type VRCToken = z.infer<typeof ZVRCToken>;

export const ZVRCTwoFactorAuth = z
  .string()
  .brand<"VRCTwoFactorAuth">("VRCTwoFactorAuth");
export type VRCTwoFactorAuth = z.infer<typeof ZVRCTwoFactorAuth>;

export const ZVRCGroupId = z
  .string()
  .startsWith("grp_")
  .brand<"VRCGroupId">("VRCGroupId");
export type VRCGroupId = z.infer<typeof ZVRCGroupId>;

export const ZVRCGroupRoleId = z
  .string()
  .startsWith("grol_")
  .brand("VRCGroupRoleId");
export type VRCGroupRoleId = z.infer<typeof ZVRCGroupRoleId>;
