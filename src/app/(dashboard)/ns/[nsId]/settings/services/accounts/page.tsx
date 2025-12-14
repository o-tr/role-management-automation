import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TNamespaceId } from "@/types/prisma";
import { AccountList } from "./_components/AccountList";
import { AddAccount } from "./_components/AddAccount";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  {
    label: "外部サービス",
    path: "/ns/[nsId]/settings/services",
  },
  {
    label: "認証情報",
    path: "/ns/[nsId]/settings/services/authentication",
  },
];

export default async function AuthenticationPage({
  params,
}: {
  params: Promise<{ nsId: TNamespaceId }>;
}) {
  const { nsId } = await params;
  return (
    <div className="h-full overflow-y-hidden flex flex-col">
      <BreadcrumbUpdater paths={paths} />
      <Dialog>
        <div className="flex flex-row justify-end">
          <DialogTrigger asChild>
            <Button>アカウントを追加</Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウントを追加</DialogTitle>
            <DialogDescription>
              <AddAccount nsId={nsId} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <AccountList nsId={nsId} />
    </div>
  );
}
