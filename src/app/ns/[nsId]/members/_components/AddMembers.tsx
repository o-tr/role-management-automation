import type { FC } from "react";
import { useOnPaste } from "../_hooks/on-paste";

type Props = {
  nsId: string;
};

export const AddMembers: FC<Props> = ({ nsId }) => {
  useOnPaste((e) => {
    console.log(
      e.clipboardData?.types.map((type) => e.clipboardData?.getData(type)),
    );
  });
  return <div>Members</div>;
};
