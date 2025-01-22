import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { FC } from "react";

type Props = {
  open: boolean;
  onOpenChange: () => void;
  onOverwrite: () => void;
};

export const OverwriteConfirm: FC<Props> = ({
  open,
  onOpenChange,
  onOverwrite,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>編集中の内容を上書きしますか?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onOverwrite}>
            上書き
          </Button>
          <Button variant="outline" onClick={onOpenChange}>
            キャンセル
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
