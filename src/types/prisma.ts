import { ZVRCGroupId } from "@/lib/vrchat/types/brand";
import type { ExternalServiceName } from "@prisma/client";
import { z } from "zod";
import type { TMappingAction } from "./actions";
import { ZColorCode } from "./brand";
import type { TMappingCondition } from "./conditions";

export const ZExternalServiceName = z.union([
  z.literal("DISCORD"),
  z.literal("VRCHAT"),
  z.literal("GITHUB"),
]);

export const ZUserId = z.string().uuid().brand("UserId");
export type TUserId = z.infer<typeof ZUserId>;
export type TUser = {
  id: TUserId;
  email: string | null;
  name: string | null;
};

const ZNamespaceId = z.string().uuid().brand("NamespaceId");
export type TNamespaceId = z.infer<typeof ZNamespaceId>;
export type TNamespace = {
  id: TNamespaceId;
  name: string;
};

export type TNamespaceWithOwnerAndAdmins = {
  id: TNamespaceId;
  name: string;
  owner: TUser;
  admins: TUser[];
};

export type TNamespaceWithRelation = {
  id: TNamespaceId;
  name: string;
  owner: TUser;
  admins: TUser[];
  members: TMember[];
  tags: TTag[];
};

export const ZTagId = z.string().uuid().brand("TagId");
export type TTagId = z.infer<typeof ZTagId>;
export const ZTag = z.object({
  id: ZTagId,
  namespaceId: ZNamespaceId,
  name: z.string(),
  color: ZColorCode.optional(),
});
export type TTag = z.infer<typeof ZTag>;

export const ZExternalServiceAccountId = z
  .string()
  .uuid()
  .brand("ServiceAccountId");
export type TExternalServiceAccountId = z.infer<
  typeof ZExternalServiceAccountId
>;
export const ZExternalServiceAccount = z.object({
  id: ZExternalServiceAccountId,
  name: z.string(),
  service: ZExternalServiceName,
  credential: z.string(),
  icon: z.string().optional(),
  namespaceId: ZNamespaceId,
});
export type TExternalServiceAccount = z.infer<typeof ZExternalServiceAccount>;

export type FExternalServiceAccount = Omit<
  TExternalServiceAccount,
  "credential"
>;

export const ZExternalServiceGroupId = z
  .string()
  .uuid()
  .brand("ExternalServiceGroupId");
export type TExternalServiceGroupId = z.infer<typeof ZExternalServiceGroupId>;
export const ZExternalServiceGroup = z.object({
  id: ZExternalServiceGroupId,
  namespaceId: ZNamespaceId,
  name: z.string(),
  service: ZExternalServiceName,
  icon: z.string().optional(),
  groupId: z.string(),
});
export type TExternalServiceGroup = z.infer<typeof ZExternalServiceGroup>;

export const ZExternalServiceGroupWithAccount = ZExternalServiceGroup.merge(
  z.object({
    account: ZExternalServiceAccount,
  }),
);
export type TExternalServiceGroupWithAccount = z.infer<
  typeof ZExternalServiceGroupWithAccount
>;

export const ZAvailableGroupId = z.union([
  z.string().uuid().brand("AvailableGroupId"),
  ZVRCGroupId,
  ZExternalServiceGroupId,
]);
export type TAvailableGroupId = z.infer<typeof ZAvailableGroupId>;
export type TAvailableGroup = {
  id: TAvailableGroupId;
  name: string;
  href?: string;
  icon?: string;
};

export const ZExternalServiceGroupMember = z.object({
  serviceId: z.string(),
  serviceUsername: z.string().optional(),
  name: z.string(),
  icon: z.string().optional(),
  roleIds: z.array(z.string()),
  isEditable: z.boolean(),
});
export type TExternalServiceGroupMember = z.infer<
  typeof ZExternalServiceGroupMember
>;

export type TExternalServiceGroupRole = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

export const ZMappingId = z.string().uuid().brand("MappingId");
export type TMappingId = z.infer<typeof ZMappingId>;
export type TSerializedMapping = {
  id: TMappingId;
  conditions: string;
  actions: string;
};

export type TMapping = {
  id: TMappingId;
  conditions: TMappingCondition;
  actions: TMappingAction[];
};

export const ZMemberId = z.string().uuid().brand("MemberId");
export type TMemberId = z.infer<typeof ZMemberId>;

export const ZMemberExternalServiceAccountId = z
  .string()
  .uuid()
  .brand("MemberExternalServiceAccountId");
export type TMemberExternalServiceAccountId = z.infer<
  typeof ZMemberExternalServiceAccountId
>;
export const ZMemberExternalServiceAccount = z.object({
  id: ZMemberExternalServiceAccountId,
  service: ZExternalServiceName,
  serviceId: z.string(),
  serviceUsername: z.string().optional(),
  name: z.string(),
  icon: z.string().optional(),
  memberId: ZMemberId,
  namespaceId: ZNamespaceId,
});
export type TMemberExternalServiceAccount = z.infer<
  typeof ZMemberExternalServiceAccount
>;

export const ZMember = z.object({
  id: ZMemberId,
  namespaceId: ZNamespaceId,
});
export type TMember = z.infer<typeof ZMember>;
export const ZMemberWithRelation = z
  .object({
    tags: z.array(ZTag),
    externalAccounts: z.array(ZMemberExternalServiceAccount),
  })
  .merge(ZMember);
export type TMemberWithRelation = z.infer<typeof ZMemberWithRelation>;

export const ZServiceRoleId = z.string().brand("ServiceRoleId");
export type TServiceRoleId = z.infer<typeof ZServiceRoleId>;
