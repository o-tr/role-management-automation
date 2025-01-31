import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { onNsChange } from "@/events/on-ns-change";
import { useNamespace } from "@/hooks/use-namespace";
import { useSetNamespaceName } from "@/hooks/use-set-namespace-name";
import { cn } from "@/lib/utils";
import type { TNamespaceId } from "@/types/prisma";
import {
  addDays,
  format,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import { ja } from "date-fns/locale";
import { type FC, type FormEvent, useEffect, useId, useState } from "react";
import { TbCalendar } from "react-icons/tb";
import {
  onInvitationsChange,
  useOnInvitationsChange,
} from "../_hook/onInvitationsChange";
import { useCreateInvitation } from "../_hook/useCreateInvitation";

type Props = {
  nsId: TNamespaceId;
};

export const CreateInvitation: FC<Props> = ({ nsId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date>(addDays(new Date(), 7));
  const { createInvitation, loading } = useCreateInvitation(nsId);

  const inputId = useId();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!expiresAt) return;

    await createInvitation({
      expires: setMilliseconds(
        setSeconds(setMinutes(setHours(expiresAt, 23), 59), 59),
        0,
      ).toISOString(),
    });
    onInvitationsChange();
  };

  useOnInvitationsChange(() => setIsModalOpen(false));

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsModalOpen(true)}>招待を作成</Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <form onSubmit={handleSubmit}>
          <Label htmlFor={inputId}>期限</Label>
          <div className="flex items-center space-x-2">
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !expiresAt && "text-muted-foreground",
                  )}
                >
                  <TbCalendar className="mr-2" />
                  {expiresAt ? (
                    format(expiresAt, "yyyy年MM月dd日(E)", {
                      locale: ja,
                    })
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={(date) => setExpiresAt((pv) => date || pv)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button disabled={loading}>作成</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
