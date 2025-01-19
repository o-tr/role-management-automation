"use client";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { useNamespace } from "@/hooks/use-namespace";
import type {
  TMappingCondition,
  TMappingConditionId,
} from "@/types/conditions";
import type { TTagId } from "@/types/prisma";
import { useState } from "react";
import { ConditionsEditor } from "./ConditionsEditor";
import { MappingList } from "./MappingList";

const paths = [
  { label: "ロール管理", path: "/ns/[nsId]/roles" },
  { label: "割り当て", path: "/ns/[nsId]/roles/mappings" },
];

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: string };
}) {
  const { namespace, isPending } = useNamespace({ namespaceId: params.nsId });

  const [conditions, setConditions] = useState<TMappingCondition>({
    type: "comparator",
    key: "some-tag",
    comparator: "equals",
    value: "some-value" as TTagId,
    id: crypto.randomUUID() as TMappingConditionId,
  });

  if (isPending || !namespace) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <MappingList namespaceId={namespace.id} />
      <ConditionsEditor
        conditions={conditions}
        onChange={(v) => setConditions(v)}
        nsId={params.nsId}
      />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
