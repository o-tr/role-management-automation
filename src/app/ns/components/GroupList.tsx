"use client";
import { Badge } from "@/components/ui/badge";
import { useNamespaces } from "@/hooks/use-namespaces";
import Link from "next/link";
import { redirect } from "next/navigation";

export const GroupList = () => {
  const { namespaces, isPending, responseError } = useNamespaces();

  if (responseError) {
    if (responseError.code === 401) {
      redirect("/");
      return null;
    }
    return <p>エラーが発生しました</p>;
  }

  if (isPending || !namespaces) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">所属ネームスペース</h2>
      {namespaces.map((namespace) => (
        <Link
          href={`/ns/${namespace.id}`}
          className="flex items-center justify-between p-3 border rounded mb-2"
          key={namespace.id}
        >
          <span>{namespace.name}</span>
          <div className={"flex flex-row justify-end items-center gap-4"}>
            {namespace.isOwner && <Badge>所有者</Badge>}
            <Badge>管理者</Badge>
          </div>
        </Link>
      ))}
      {namespaces.length === 0 && <p>グループがありません</p>}
    </div>
  );
};
