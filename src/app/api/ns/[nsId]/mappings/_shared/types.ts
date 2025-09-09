import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";

export type ServiceProgressState = {
  status: "pending" | "in_progress" | "completed" | "error";
  current: number;
  total: number | "unknown";
  message: string;
  error?: string;
  isApproximate?: boolean;
};

export type CommonProgressUpdate =
  | {
      type: "progress";
      stage: "fetching_members" | "calculating_diff";
      services: {
        [key: string]: ServiceProgressState;
      };
    }
  | {
      type: "complete";
      result: TMemberWithDiff[];
    }
  | {
      type: "error";
      error: string;
    };

export type CommonProgressCallback = (progress: CommonProgressUpdate) => void;

export interface GetMemberWithDiffWithProgressOptions {
  nsId: TNamespaceId;
  onProgress: CommonProgressCallback;
}
