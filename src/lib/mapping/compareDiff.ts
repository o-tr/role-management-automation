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
      const diffB = diffItemB.diff.find((item) => {
        if (item.type !== diff.type) {
          return false;
        }
        if (item.serviceGroup.id !== diff.serviceGroup.id) {
          return false;
        }
        if (item.ignore !== diff.ignore) {
          return false;
        }
        if (
          (diff.type === "add" || diff.type === "remove") &&
          (item.type === "add" || item.type === "remove")
        ) {
          return (
            item.groupMember.serviceId === diff.groupMember.serviceId &&
            item.roleId === diff.roleId
          );
        }
        if (diff.type === "invite-group" && item.type === "invite-group") {
          return item.targetAccount.serviceId === diff.targetAccount.serviceId;
        }
        return false;
      });
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
