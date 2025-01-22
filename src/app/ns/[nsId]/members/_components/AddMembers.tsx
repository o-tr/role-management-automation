import type { FC } from "react";
import { useOnPaste } from "../_hooks/on-paste";

type Props = {
  nsId: string;
};

export const AddMembers: FC<Props> = ({ nsId }) => {
  useOnPaste((e) => {
    if (!e.clipboardData?.types.includes("text/html")) return;
    const html = e.clipboardData?.getData("text/html");
    if (!html?.includes("<table")) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const rows = doc.getElementsByTagName("tr");
    const members = Array.from(rows).map((row) => {
      const cells = row.getElementsByTagName("td");
      return Array.from(cells).map((cell) => cell.innerText);
    });
  });
  return <div>Members</div>;
};
