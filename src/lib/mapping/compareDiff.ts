import type { TMemberWithDiff } from "@/types/diff";

export const compareDiff = (
  diffA: TMemberWithDiff[],
  diffB: TMemberWithDiff[],
): boolean => {
  if (diffA.length !== diffB.length) {
    console.log(`Diff length mismatch: ${diffA.length} !== ${diffB.length}`);
    return false;
  }
  for (const diffItemA of diffA) {
    const diffItemB = diffB.find(
      (item) => item.member.id === diffItemA.member.id,
    );
    if (!diffItemB) {
      console.log(`Member ${diffItemA.member.id} not found`);
      return false;
    }
    if (diffItemB.diff.length !== diffItemA.diff.length) {
      console.log(
        `Member ${diffItemA.member.id} diff length mismatch: ${diffItemA.diff.length} !== ${diffItemB.diff.length}`,
      );
      return false;
    }
    for (const diff of diffItemA.diff) {
      const diffB = diffItemB.diff.find(
        (item) =>
          item.type === diff.type &&
          item.serviceGroup.id === diff.serviceGroup.id &&
          item.groupMember.serviceId === diff.groupMember.serviceId &&
          item.roleId === diff.roleId &&
          item.ignore === diff.ignore,
      );
      if (!diffB) {
        console.log(
          `Member ${diffItemA.member.id} diff item not found: ${JSON.stringify(
            diff,
          )}`,
        );
        return false;
      }
    }
  }
  return true;
};
