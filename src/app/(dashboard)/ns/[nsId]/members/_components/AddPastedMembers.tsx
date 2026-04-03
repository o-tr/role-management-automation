import { type FC, useCallback, useState } from "react";
import type { ResolveResult } from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import type { TCreateOrUpdateMembers } from "@/lib/prisma/createOrUpdateMember";
import { ZVRCUserId } from "@/lib/vrchat/types/brand";
import type { TNamespaceId, TTagId } from "@/types/prisma";
import { MultipleTagPicker } from "../../components/MultipleTagPicker";
import { useTags } from "../../roles/_hooks/use-tags";
import {
  onMembersChange,
  useOnMembersChange,
} from "../_hooks/on-members-change";
import { useOnPaste } from "../_hooks/on-paste";
import { useCreateMembers } from "../_hooks/use-create-members";
import { parseClipboard } from "../_utils/parseClipboard";
import { MemberPreviewTable } from "./MemberPreviewTable";
import { OverwriteConfirm } from "./OverwriteConfirm";
import { PastedTable } from "./PastedTable";

type Props = {
  nsId: TNamespaceId;
};

type TKeys =
  | "DiscordUserId" // number
  | "DiscordUsername" // string
  | "VRCUserId" // usr_<string>
  | "GitHubUserId" // number
  | "GitHubUsername" // string
  | "unknown";

const _Keys = [
  "DiscordUserId",
  "DiscordUsername",
  "VRCUserId",
  "GitHubUserId",
  "GitHubUsername",
  "unknown",
];

export type RowObject = {
  id: string;
  data: {
    value: string;
    error?: string;
    data?: ResolveResult;
  }[];
};

export const AddPastedMembers: FC<Props> = ({ nsId }) => {
  const [members, setMembers] = useState<RowObject[]>([]);
  const [tmpPasted, setTmpPasted] = useState<RowObject[] | undefined>();
  const [tmpPastedKeys, setTmpPastedKeys] = useState<TKeys[]>([]);
  const [keys, setKeys] = useState<TKeys[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TTagId[]>([]);
  const { createMembers, loading } = useCreateMembers(nsId);
  const { toast } = useToast();
  const { tags, isPending } = useTags(nsId);
  const isMutating = loading;
  const resetState = useCallback(() => {
    setMembers([]);
    setKeys([]);
    setConfirmModalOpen(false);
    setSelectedTags([]);
  }, []);

  useOnPaste((e) => {
    if (isMutating) return;
    const pasted = parseClipboard(e);
    if (!pasted) return;
    e.preventDefault();
    const keys = pasted[0].map((val) => {
      if (ZVRCUserId.safeParse(val).success) {
        return "VRCUserId";
      }
      return "unknown";
    });
    if (members.length !== 0) {
      setTmpPasted(
        pasted.map((data) => ({
          id: crypto.randomUUID(),
          data: data.map((val) => ({ value: val })),
        })),
      );
      setTmpPastedKeys(keys);
      return;
    }
    setMembers(
      pasted.map((data) => ({
        id: crypto.randomUUID(),
        data: data.map((val) => ({ value: val })),
      })),
    );
    setKeys(keys);
  });
  useOnMembersChange(resetState);

  const register = async () => {
    if (isMutating) return;
    const tags = selectedTags.map((tagId) => tagId);
    const data: TCreateOrUpdateMembers = members.map((row) => {
      const services = row.data
        .map((val) => ("data" in val ? val.data : undefined))
        .filter((v) => !!v)
        .map((val) => {
          return {
            memberId: val.memberId,
            name: val.name ?? "",
            service: val.service,
            serviceId: val.serviceId,
            serviceUsername: val.serviceUsername,
            icon: val.icon,
          };
        });
      const memberId = services.find((s) => s.memberId)?.memberId;
      return { services, tags, memberId };
    });

    try {
      await createMembers(data);
      onMembersChange();
      setSelectedTags([]);
    } catch (error) {
      toast({
        title: "メンバー登録に失敗しました",
        description:
          error instanceof Error
            ? error.message
            : "しばらくしてから再度お試しください。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2 items-start">
      <Dialog
        open={members.length !== 0}
        onOpenChange={(open) => {
          if (isMutating) return;
          if (!open) {
            resetState();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メンバーを追加</DialogTitle>
          </DialogHeader>
          <PastedTable
            data={members}
            keys={keys}
            setData={setMembers}
            setKeys={setKeys}
            disabled={isMutating}
          />
          <Dialog
            open={confirmModalOpen}
            onOpenChange={(open) => {
              if (isMutating && !open) return;
              setConfirmModalOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={isMutating}>確認</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-full overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>確認</DialogTitle>
              </DialogHeader>
              <MemberPreviewTable
                data={members}
                keys={keys}
                setData={setMembers}
                nsId={nsId}
                disabled={isMutating}
              />
              {tags && !isPending && (
                <MultipleTagPicker
                  tags={tags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  disabled={isMutating}
                />
              )}
              <DialogFooter>
                <Button disabled={isMutating} onClick={register}>
                  登録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
      <OverwriteConfirm
        open={!!tmpPasted}
        onOpenChange={() => setTmpPasted(undefined)}
        onOverwrite={() => {
          setMembers(tmpPasted ?? []);
          setKeys(tmpPastedKeys);
          setTmpPasted(undefined);
        }}
      />
    </div>
  );
};
