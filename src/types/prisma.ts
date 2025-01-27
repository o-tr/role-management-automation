import { ZVRCGroupId } from "@/lib/vrchat/types/brand";
import type { ExternalServiceName } from "@prisma/client";
import { z } from "zod";
import type { TMappingAction } from "./actions";
import type { TMappingCondition } from "./conditions";

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
export type TTag = {
  id: TTagId;
  name: string;
  namespaceId: TNamespaceId;
};

export const ZExternalServiceAccountId = z
  .string()
  .uuid()
  .brand("ServiceAccountId");
export type TExternalServiceAccountId = z.infer<
  typeof ZExternalServiceAccountId
>;
export type TExternalServiceAccount = {
  id: TExternalServiceAccountId;
  name: string;
  service: ExternalServiceName;
  credential: string;
  icon?: string;
  namespaceId: TNamespaceId;
};

export type FExternalServiceAccount = Omit<
  TExternalServiceAccount,
  "credential"
>;

export const ZAvailableGroupId = z.union([
  z.string().uuid().brand("AvailableGroupId"),
  ZVRCGroupId,
]);
export type TAvailableGroupId = z.infer<typeof ZAvailableGroupId>;
export type TAvailableGroup = {
  id: TAvailableGroupId;
  name: string;
  href?: string;
  icon?: string;
};

export const ZExternalServiceGroupId = z.union([
  z.string().uuid().brand("ExternalServiceGroupId"),
  ZVRCGroupId,
]);
export type TExternalServiceGroupId = z.infer<typeof ZExternalServiceGroupId>;
export type TExternalServiceGroup = {
  id: TExternalServiceGroupId;
  namespaceId: TNamespaceId;
  name: string;
  service: ExternalServiceName;
  icon?: string;
  groupId: string;
};

export type TExternalServiceGroupWithAccount = TExternalServiceGroup & {
  account: TExternalServiceAccount;
};

export type TExternalServiceGroupMember = {
  serviceId: string;
  serviceUsername?: string;
  name: string;
  icon?: string;
  roleIds: string[];
};

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
export type TMember = {
  id: TMemberId;
  namespaceId: TNamespaceId;
};
export type TMemberWithRelation = TMember & {
  tags: TTag[];
  externalAccounts: TMemberExternalServiceAccount[];
};

export const ZMemberExternalServiceAccountId = z
  .string()
  .uuid()
  .brand("MemberExternalServiceAccountId");
export type TMemberExternalServiceAccountId = z.infer<
  typeof ZMemberExternalServiceAccountId
>;
export type TMemberExternalServiceAccount = {
  id: TMemberExternalServiceAccountId;
  service: ExternalServiceName;
  serviceId: string;
  serviceUsername?: string;
  name: string;
  icon: string | undefined;
  memberId: TMemberId;
  namespaceId: TNamespaceId;
};

export const ZExternalServiceName = z.union([
  z.literal("DISCORD"),
  z.literal("VRCHAT"),
  z.literal("GITHUB"),
]);

export const ZServiceRoleId = z.string().brand("ServiceRoleId");
export type TServiceRoleId = z.infer<typeof ZServiceRoleId>;
