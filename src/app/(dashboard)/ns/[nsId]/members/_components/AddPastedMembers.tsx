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
import type { TCreateOrUpdateMembers } from "@/lib/prisma/createOrUpdateMember";
import { ZVRCUserId } from "@/lib/vrchat/types/brand";
import type { TNamespaceId, TTagId } from "@/types/prisma";
import { type FC, useState } from "react";
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

const Keys = [
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
  const { tags, isPending } = useTags(nsId);
  useOnPaste((e) => {
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
  useOnMembersChange(() => {
    setMembers([]);
    setKeys([]);
    setConfirmModalOpen(false);
  });

  const register = async () => {
    const tags = selectedTags.map((tagId) => tagId);
    const data: TCreateOrUpdateMembers = members.map((row) => {
      const services = row.data
        .map((val) => ("data" in val ? val.data : undefined))
        .filter((v) => !!v)
        .map((val) => {
          return {
            memberId: val.memberId,
            name: val.name,
            service: val.service,
            serviceId: val.serviceId,
            serviceUsername: val.serviceUsername,
            icon: val.icon,
          };
        });
      const memberId = services.find((s) => s.memberId)?.memberId;
      return { services, tags, memberId };
    });

    await createMembers(data);
    onMembersChange();
  };

  return (
    <div className="flex flex-col space-y-2 items-start">
      <Dialog open={members.length !== 0} onOpenChange={() => setMembers([])}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メンバーを追加</DialogTitle>
          </DialogHeader>
          <PastedTable
            data={members}
            keys={keys}
            setData={setMembers}
            setKeys={setKeys}
          />
          <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading}>確認</Button>
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
              />
              {tags && !isPending && (
                <MultipleTagPicker
                  tags={tags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              )}
              <DialogFooter>
                <Button disabled={loading} onClick={register}>
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
