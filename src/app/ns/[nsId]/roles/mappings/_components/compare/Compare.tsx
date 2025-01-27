import { useMembers } from "@/app/ns/[nsId]/members/_hooks/use-tags";
import type { TMapping } from "@/types/prisma";
import { type FC, useEffect, useState } from "react";
import { useMappings } from "../../../_hooks/use-mappings";

type Props = {
  nsId: string;
};

type TargetGroup = {
  service: string;
  group: string;
};

export const Compare: FC<Props> = ({ nsId }) => {
  const { members, isPending: isMembersPending } = useMembers(nsId);
  const { mappings, isPending: isMappingsPending } = useMappings(nsId);
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>();

  useEffect(() => {
    if (mappings) {
      setTargetGroups(extractTargetGroups(mappings));
    }
  }, [mappings]);

  if (isMembersPending || isMappingsPending || !members || !mappings) {
    return <div>Loading...</div>;
  }
};

const extractTargetGroups = (mappings: TMapping[]) => {
  const targets: TargetGroup[] = [];

  for (const mapping of mappings) {
    for (const action of mapping.actions) {
      if (
        targets.some(
          (target) =>
            target.service === action.targetServiceAccountId &&
            target.group === action.targetServiceGroupId,
        )
      ) {
        continue;
      }
      targets.push({
        service: action.targetServiceAccountId,
        group: action.targetServiceGroupId,
      });
    }
  }
  return targets;
};
