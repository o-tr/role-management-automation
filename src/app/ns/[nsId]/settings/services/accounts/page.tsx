import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
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

export default function AuthenticationPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  return (
    <div className="space-y-4">
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
              <AddAccount nsId={params.nsId} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <AccountList nsId={params.nsId} />
    </div>
  );
}
