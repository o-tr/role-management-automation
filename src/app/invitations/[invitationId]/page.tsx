"use client";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import type { TNamespaceInvitationId } from "@/types/prisma";
import { useAcceptInvitation } from "../_hooks/useAcceptInvitation";
import { useInvitation } from "../_hooks/useInvitation";

export default function GroupTagsPage({
  params,
}: {
  params: Promise<{ invitationId: TNamespaceInvitationId }>;
}) {
  const { invitationId } = use(params);
  const { invitation, isPending, responseError } = useInvitation(invitationId);
  const { acceptInvitation, loading } = useAcceptInvitation(invitationId);
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (responseError) {
    if (responseError.error === "already_belongs") {
      return (
        <div className="grid place-items-center min-h-screen">
          <div>
            <p>既にこのネームスペースに所属しています</p>
            <Link href={"/ns"}>
              <Button>ネームスペース一覧に戻る</Button>
            </Link>
          </div>
        </div>
      );
    }
    if (responseError.code === 401) {
      signIn("discord", {
        callbackUrl: `/invitations/${invitationId}`,
      });
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

  if (!invitation) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div>
          <h2>招待が見つかりませんでした</h2>
          <p>招待が存在しないか期限が切れています</p>
          <p>間違いだと思われる場合は発行者に再発行を依頼してください</p>
        </div>
      </div>
    );
  }

  const handleAcceptInvitation = async () => {
    const response = await acceptInvitation();
    if (response.status !== "success") {
      router.refresh();
      return;
    }

    router.replace(`/ns/${invitation.namespace.id}/`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">
        {invitation.namespace.name}に招待されました
      </h1>
      <p>
        招待リンクの期限:{" "}
        {format(invitation.expires, "yyyy年MM月dd日(E)", {
          locale: ja,
        })}
      </p>
      <Button size="lg" disabled={loading} onClick={handleAcceptInvitation}>
        参加する
      </Button>
    </div>
  );
}
