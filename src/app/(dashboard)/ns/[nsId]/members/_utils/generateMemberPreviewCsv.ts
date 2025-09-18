import type {
  ResolveResponse,
  ResolveResult,
  TResolveRequestType,
} from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { ZVRCUserId } from "@/lib/vrchat/types/brand";
import type { TMemberWithRelation } from "@/types/prisma";
import pLimit from "p-limit";
import type { RowObject } from "../_components/AddPastedMembers";

type TKeys = TResolveRequestType | "unknown";
type Status = "登録済み" | "存在する" | "存在しない";

const valueHeaderLabel = (key: TKeys): string => {
  switch (key) {
    case "VRCUserId":
      return "vrchat id";
    case "DiscordUserId":
      return "discord id";
    case "DiscordUsername":
      return "discord username";
    case "GitHubUserId":
      return "github id";
    case "GitHubUsername":
      return "github username";
    case "unknown":
      return "unknown";
  }
};

const statusHeaderLabel = (key: TKeys): string | undefined => {
  switch (key) {
    case "VRCUserId":
      return "vrchat accountの存在";
    case "DiscordUserId":
    case "DiscordUsername":
      return "discord accountの存在";
    case "GitHubUserId":
    case "GitHubUsername":
      return "github accountの存在";
    default:
      return undefined;
  }
};

const escapeCsv = (val: string) => {
  const escaped = val.replace(/"/g, '""');
  return `"${escaped}"`;
};

const urlFor = (nsId: string, key: TResolveRequestType, value: string) =>
  `/api/ns/${nsId}/members/resolve/${key}/${encodeURIComponent(value)}`;

export async function generateMemberPreviewCsv(args: {
  nsId: string;
  data: RowObject[];
  keys: TKeys[];
  members: TMemberWithRelation[] | undefined;
}): Promise<string> {
  const { nsId, data, keys, members } = args;

  const memory = new Map<string, ResolveResponse>();
  const limit = pLimit(5);
  const memberIdToTagsLabel = new Map<string, string>();
  if (members) {
    for (const m of members) {
      const label = m.tags?.length ? m.tags.map((t) => t.name).join("; ") : "";
      memberIdToTagsLabel.set(m.id, label);
    }
  }

  const ensureResolved = async (
    key: TKeys,
    value: string,
    existing?: ResolveResult,
  ): Promise<ResolveResult | undefined> => {
    if (key === "unknown") return undefined;
    if (existing) return existing;
    if (key === "VRCUserId") {
      const parsed = ZVRCUserId.safeParse(value);
      if (!parsed.success) return undefined;
    }
    const requestUrl = urlFor(nsId, key as TResolveRequestType, value);
    const inMem = memory.get(requestUrl);
    if (inMem?.status === "success") {
      return inMem.item;
    }
    try {
      const res = await limit(() => fetch(requestUrl));
      const json: ResolveResponse = await res.json();
      if (json?.status === "success") {
        memory.set(requestUrl, json);
        return json.item;
      }
    } catch (e) {
      console.error("generateMemberPreviewCsv.ensureResolved: fetch failed", {
        requestUrl,
        nsId,
        key,
        value,
        error: e,
      });
    }
    return undefined;
  };

  const resolveStatus = (
    item?: ResolveResult,
  ): { status: Status; memberId?: string } => {
    if (!item) return { status: "存在しない" };
    if (item.memberId) return { status: "登録済み", memberId: item.memberId };
    return { status: "存在する" };
  };

  // ヘッダー作成
  const headers: string[] = [];
  for (const k of keys) {
    headers.push(valueHeaderLabel(k));
    if (k === "VRCUserId") headers.push("vrchat username");
    if (k === "DiscordUserId" || k === "DiscordUsername")
      headers.push("discord display name");
    const h = statusHeaderLabel(k);
    if (h) headers.push(h);
  }
  headers.push("紐づくタグ");

  const rowPromises = data.map(async (row) => {
    const csvRow: string[] = [];
    let associatedMemberId: string | undefined;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const cell = row.data[i];
      const value = cell.value;
      csvRow.push(escapeCsv(value));

      if (key !== "unknown") {
        const existing = ("data" in cell ? cell.data : undefined) as
          | ResolveResult
          | undefined;
        const item = await ensureResolved(key, value, existing);
        if (
          key === "VRCUserId" ||
          key === "DiscordUserId" ||
          key === "DiscordUsername"
        ) {
          csvRow.push(escapeCsv(item?.name || ""));
        }
        const { status, memberId } = resolveStatus(item);
        if (!associatedMemberId && memberId) associatedMemberId = memberId;
        csvRow.push(escapeCsv(status));
      }
    }
    // 紐づくタグ
    let tagsLabel = "";
    if (associatedMemberId) {
      tagsLabel = memberIdToTagsLabel.get(associatedMemberId) ?? "";
    }
    csvRow.push(escapeCsv(tagsLabel));
    return csvRow.join(",");
  });

  const rows: string[] = [
    headers.map(escapeCsv).join(","),
    ...(await Promise.all(rowPromises)),
  ];

  return rows.join("\n");
}
