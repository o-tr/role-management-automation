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
  const s = val ?? "";
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
};

const urlFor = (nsId: string, key: TResolveRequestType, value: string) =>
  `/api/ns/${nsId}/members/resolve/${key}/${encodeURIComponent(value)}`;

export async function generateMemberPreviewCsv(args: {
  nsId: string;
  data: RowObject[];
  keys: TKeys[];
  members: TMemberWithRelation[] | undefined;
  getCached: (key: string) => ResolveResponse | undefined;
  setCached: (key: string, value: ResolveResponse) => void;
}): Promise<string> {
  const { nsId, data, keys, members, getCached, setCached } = args;

  const memory = new Map<string, ResolveResponse>();
  const limit = pLimit(5);

  const ensureResolved = async (
    key: TKeys,
    value: string,
    existing?: ResolveResult,
  ): Promise<ResolveResult | undefined> => {
    if (key === "unknown") return undefined;
    if (existing) return existing;
    const requestUrl = urlFor(nsId, key as TResolveRequestType, value);
    const inMem = memory.get(requestUrl);
    if (inMem?.status === "success") {
      return inMem.item;
    }
    const cached = getCached(requestUrl);
    if (cached?.status === "success") {
      memory.set(requestUrl, cached);
      return cached.item;
    }
    try {
      const res = await limit(() => fetch(requestUrl));
      const json: ResolveResponse = await res.json();
      if (json?.status === "success") {
        memory.set(requestUrl, json);
        setCached(requestUrl, json);
        return json.item;
      }
    } catch (_e) {
      // noop
    }
    return undefined;
  };

  const resolveStatus = async (
    key: TKeys,
    value: string,
    existing?: ResolveResult,
  ): Promise<{ status: Status; memberId?: string }> => {
    if (key === "unknown") return { status: "存在しない" };
    if (!existing && key === "VRCUserId") {
      const parsed = ZVRCUserId.safeParse(value);
      if (!parsed.success) return { status: "存在しない" };
    }
    const item = await ensureResolved(key, value, existing);
    if (item) {
      if (item.memberId) return { status: "登録済み", memberId: item.memberId };
      return { status: "存在する" };
    }
    return { status: "存在しない" };
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
        if (key === "VRCUserId") {
          const item = await ensureResolved(key, value, existing);
          csvRow.push(escapeCsv(item?.name || ""));
        }
        if (key === "DiscordUserId" || key === "DiscordUsername") {
          const item = await ensureResolved(key, value, existing);
          csvRow.push(escapeCsv(item?.name || ""));
        }
        const { status, memberId } = await resolveStatus(key, value, existing);
        if (!associatedMemberId && memberId) associatedMemberId = memberId;
        csvRow.push(escapeCsv(status));
      }
    }
    // 紐づくタグ
    let tagsLabel = "";
    if (associatedMemberId && members) {
      const m = members.find((mm) => mm.id === associatedMemberId);
      if (m?.tags?.length) {
        tagsLabel = m.tags.map((t) => t.name).join("; ");
      }
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
