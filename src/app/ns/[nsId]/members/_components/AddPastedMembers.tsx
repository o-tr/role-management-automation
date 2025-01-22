import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ZVRCUserId } from "@/lib/vrchat/types/brand";
import { DialogDescription } from "@radix-ui/react-dialog";
import { type FC, useState } from "react";
import { useOnPaste } from "../_hooks/on-paste";
import { parseClipboard } from "../_utils/parseClipboard";
import { MemberPreviewTable } from "./MemberPreviewTable";
import { OverwriteConfirm } from "./OverwriteConfirm";
import { PastedTable } from "./PastedTable";

type Props = {
  nsId: string;
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

type RowObject = {
  id: string;
  data: string[];
};

export const AddPastedMembers: FC<Props> = ({ nsId }) => {
  const [members, setMembers] = useState<RowObject[]>([]);
  const [tmpPasted, setTmpPasted] = useState<RowObject[] | undefined>();
  const [tmpPastedKeys, setTmpPastedKeys] = useState<TKeys[]>([]);
  const [keys, setKeys] = useState<TKeys[]>([]);
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
      setTmpPasted(pasted.map((data) => ({ id: crypto.randomUUID(), data })));
      setTmpPastedKeys(keys);
      return;
    }
    setMembers(pasted.map((data) => ({ id: crypto.randomUUID(), data })));
    setKeys(keys);
  });

  return (
    <>
      <PastedTable
        data={members}
        keys={keys}
        setData={setMembers}
        setKeys={setKeys}
      />
      <OverwriteConfirm
        open={!!tmpPasted}
        onOpenChange={() => setTmpPasted(undefined)}
        onOverwrite={() => {
          setMembers(tmpPasted ?? []);
          setKeys(tmpPastedKeys);
          setTmpPasted(undefined);
        }}
      />
      <Dialog>
        <DialogTrigger asChild>
          <Button>確認</Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-full overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>確認</DialogTitle>
            <DialogDescription>
              <MemberPreviewTable
                data={members}
                keys={keys}
                setData={setMembers}
                setKeys={setKeys}
                nsId={nsId}
              />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
