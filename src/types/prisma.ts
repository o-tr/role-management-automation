import type { ExternalServiceName } from "@prisma/client";
import { z } from "zod";
import type { TMappingAction } from "./actions";
import type { TMappingCondition } from "./conditions";

export type TNamespace = {
  id: string;
  name: string;
  isOwner: boolean;
};

export type TNamespaceDetail = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  admins: {
    id: string;
    name: string | null;
    email: string | null;
  }[];
  members: {
    id: string;
    name: string;
    email: string;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
  isOwner: boolean;
};

export type TTag = {
  id: string;
  name: string;
};

export type TServiceAccount = {
  id: string;
  name: string;
  service: string;
  icon?: string;
};

export type TAvailableGroup = {
  id: string;
  name: string;
  href?: string;
  icon?: string;
};

export type TExternalServiceGroup = {
  id: string;
  name: string;
  service: ExternalServiceName;
  icon?: string;
};

export type TExternalServiceGroupDetail = {
  id: string;
  name: string;
  icon?: string;
  account: {
    id: string;
    name: string;
    service: ExternalServiceName;
    icon?: string;
  };
};

export type TExternalServiceGroupRole = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

export type TSerializedMapping = {
  id: string;
  conditions: string;
  actions: string;
};

export type TMapping = {
  id: string;
  name: string;
  conditions: TMappingCondition;
  actions: TMappingAction[];
  groupId: string;
  accountId: string;
  group: {
    id: string;
    name: string;
    icon?: string;
  };
  account: {
    id: string;
    name: string;
    service: ExternalServiceName;
    icon?: string;
  };
};

export const ZExternalServiceName = z.union([
  z.literal("DISCORD"),
  z.literal("VRCHAT"),
  z.literal("GITHUB"),
]);

export const ZTagId = z.string().uuid().brand("TagId");
export type TTagId = z.infer<typeof ZTagId>;
export const ZServiceRoleId = z.string().brand("ServiceRoleId");
export type TServiceRoleId = z.infer<typeof ZServiceRoleId>;
