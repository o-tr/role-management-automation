"use client";
import { BreadcrumbContext } from "@/app/ns/[nsId]/components/Breadcrumb";
import { useParams } from "next/navigation";
import { useContext, useLayoutEffect } from "react";

export const BreadcrumbUpdater = () => {
  const { setValue } = useContext(BreadcrumbContext);
  const { nsId } = useParams<{ nsId: string }>();

  useLayoutEffect(() => {
    setValue([
      { label: "グループ設定", path: `/ns/${nsId}/settings` },
      { label: "タグ管理", path: `/ns/${nsId}/settings/tags` },
    ]);
  }, [nsId, setValue]);

  return null;
};
