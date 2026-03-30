import { type FormEvent, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import type { TColorCode } from "@/types/brand";
import type { TNamespaceId, TTag } from "@/types/prisma";
import { onTagsChange } from "../_hooks/on-tags-change";
import { useUpdateTag } from "../_hooks/use-update-tag";

type Props = {
  nsId: TNamespaceId;
  tag: TTag;
  disabled?: boolean;
  onUpdated?: (tag: TTag) => void | Promise<void>;
};
export const EditTag = ({ nsId, tag, disabled, onUpdated }: Props) => {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateTag, loading } = useUpdateTag(nsId, tag.id);
  const { toast } = useToast();
  const isPending = disabled || loading || isSubmitting;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setIsSubmitting(true);
    try {
      const response = await updateTag({
        name,
        color,
      });
      if (response.status === "success") {
        await onUpdated?.(response.tag);
      } else {
        onTagsChange();
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "タグ更新に失敗しました",
        description:
          error instanceof Error
            ? error.message
            : "しばらくしてから再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (isPending) return;
        setIsModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          編集
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <h1>Edit Tag</h1>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1">
            <Label>Name</Label>
            <Input
              placeholder="Name"
              value={name}
              onChange={(v) => setName(v.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Color</Label>
            <div className="flex flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    type="button"
                    className="w-[200px]"
                    style={{ backgroundColor: color }}
                    disabled={isPending}
                  />
                </PopoverTrigger>
                <PopoverContent className="p-2 w-fit">
                  <HexColorPicker
                    color={color}
                    onChange={(c) => setColor(c as TColorCode)}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={color}
                placeholder="#000000"
                onChange={(v) => setColor(v.target.value as TColorCode)}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              更新
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
