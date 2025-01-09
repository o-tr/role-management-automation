"use client";
import { useContext, useLayoutEffect } from "react";
import { BreadcrumbContext } from "@/app/ns/[nsId]/components/Breadcrumb";
import { useParams } from "next/navigation";

export const BreadcrumbUpdater = () => {
  const { setValue } = useContext(BreadcrumbContext);
  const { groupId } = useParams<{ groupId: string }>();

  useLayoutEffect(() => {
    setValue([
      { label: "グループ設定", path: `/groups/${groupId}/settings` },
      {
        label: "外部プロバイダー",
        path: `/groups/${groupId}/settings/providers`,
      },
    ]);
  }, [groupId, setValue]);

  return null;
};
