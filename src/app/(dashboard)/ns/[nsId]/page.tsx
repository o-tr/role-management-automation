"use client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { useNamespace } from "@/hooks/use-namespace";
import type { TNamespaceId } from "@/types/prisma";
import { DescriptionImage } from "./_assets/description.svg";

export default function GroupPage({
  params,
}: {
  params: Promise<{ nsId: TNamespaceId }>;
}) {
  const { nsId } = use(params);
  const { namespace, responseError, isPending } = useNamespace({
    namespaceId: nsId,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (responseError) {
    if (responseError.code === 401) {
      redirect("/");
      return null;
    }
    if (responseError.code === 404) {
      redirect("/ns");
      return null;
    }
    return (
      <div className="grid place-items-center min-h-screen">
        <div>
          <h2>エラーが発生しました</h2>
          <p>{responseError.error}</p>
          <p>発生したエラーが解決しない場合は管理者にお問い合わせください</p>
        </div>
      </div>
    );
  }
  if (!namespace) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div>
          <h2>ネームスペースが見つかりませんでした</h2>
          <p>ネームスペースが削除された可能性があります</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid place-items-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <p>
          タグに各グループのロールを紐づけることで、各メンバーに一括でロールを付与することができます
        </p>
        <DescriptionImage />
        <div className="flex flex-row gap-2">
          <Link href={`/ns/${namespace.id}/members`}>
            <Button>メンバーの管理</Button>
          </Link>
          <Link href={`/ns/${namespace.id}/roles/tags`}>
            <Button>タグの管理</Button>
          </Link>
          <Link href={`/ns/${namespace.id}/roles/mappings`}>
            <Button>割り当ての管理</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
