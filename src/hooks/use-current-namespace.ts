import type { NamespaceDetailResponse } from "@/app/api/ns/[nsId]/route";
import type { TNamespaceId } from "@/types/prisma";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useNamespace } from "./use-namespace";
import { useNamespaces } from "./use-namespaces";

export const useCurrentNamespace = (): {
  namespace: NamespaceDetailResponse | undefined;
  nsId: TNamespaceId | undefined;
} => {
  const { nsId: currentNsId } = useParams<{ nsId: TNamespaceId }>();
  const { namespaces, responseError } = useNamespaces();
  const [nsId, setNsId] = useState<TNamespaceId>(currentNsId);

  useEffect(() => {
    if (currentNsId) {
      setNsId(currentNsId);
    }
    if (namespaces && namespaces.length > 0 && !currentNsId) {
      setNsId(namespaces[0].id);
    }
    if (responseError) {
      if (responseError.code === 404 || responseError.code === 403) {
        redirect("/ns");
        return;
      }
      if (responseError.code === 401) {
        redirect("/");
        return;
      }
    }
  }, [currentNsId, namespaces, responseError]);

  const { namespace } = useNamespace({ namespaceId: nsId });

  return { namespace, nsId };
};
