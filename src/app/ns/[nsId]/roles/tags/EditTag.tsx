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
import type { TColorCode } from "@/types/brand";
import type { TNamespaceId, TTag } from "@/types/prisma";
import { type FormEvent, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { onTagsChange } from "../_hooks/on-tags-change";
import { useUpdateTag } from "../_hooks/use-update-tag";

type Props = {
  nsId: TNamespaceId;
  tag: TTag;
};
export const EditTag = ({ nsId, tag }: Props) => {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateTag, loading } = useUpdateTag(nsId, tag.id);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateTag({
      name,
      color,
    });
    onTagsChange();
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">編集</Button>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              更新
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
