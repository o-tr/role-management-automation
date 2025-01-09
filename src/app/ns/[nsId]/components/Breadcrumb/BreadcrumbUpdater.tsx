"use client";
import { BreadcrumbContext } from "@/app/ns/[nsId]/components/Breadcrumb";
import { useParams } from "next/navigation";
import { FC, useContext, useLayoutEffect } from "react";

type Props = {
  paths: { label: string; path: string }[];
}

export const BreadcrumbUpdater: FC<Props> = ({paths}) => {
  const { setValue } = useContext(BreadcrumbContext);
  const { nsId } = useParams<{ nsId: string }>();

  useLayoutEffect(() => {
    setValue(paths.map(({path,label}) => ({
      path: path.replace("[nsId]", nsId),
      label,
    })));
  }, [nsId, paths, setValue]);

  return null;
};
