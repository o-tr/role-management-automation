import { z } from "zod";

export const ZVRCUserId = z.string().brand<"VRCUserId">("VRCUserId");
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
