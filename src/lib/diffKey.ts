// Shared utility to generate stable per-diff task keys used by both
// client and server. Keep logic simple and deterministic.
export const makeDiffKey = (
  mi: number,
  di: number,
  service: string,
  groupId: unknown,
  serviceIdOrUsername?: unknown,
  roleId?: unknown,
): string => {
  return `${mi}-${di}-${service}-${String(groupId)}-${String(
    serviceIdOrUsername ?? "",
  )}-${String(roleId)}`;
};

// Convenience wrapper when you have a diff item shape. Importing the
// type is optional; keep the function loosely typed to avoid coupling.
export const makeDiffKeyFromItem = (
  mi: number,
  di: number,
  diffItem: {
    serviceGroup: { service: string; groupId: unknown };
    groupMember?: { serviceId?: unknown; serviceUsername?: unknown } | null;
    targetAccount?: { serviceId?: unknown; serviceUsername?: unknown } | null;
    roleId?: unknown;
  },
): string => {
  const identifier =
    diffItem.groupMember?.serviceId ??
    diffItem.groupMember?.serviceUsername ??
    diffItem.targetAccount?.serviceId ??
    diffItem.targetAccount?.serviceUsername ??
    "";
  return makeDiffKey(
    mi,
    di,
    diffItem.serviceGroup.service,
    diffItem.serviceGroup.groupId,
    identifier,
    diffItem.roleId,
  );
};
