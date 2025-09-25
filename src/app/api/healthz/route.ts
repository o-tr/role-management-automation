import type { NextRequest } from "next/server";
import { api } from "@/lib/api";

export type GetHealthzResponse = {
  status: "success";
};

export const GET = api(
  async (_req: NextRequest): Promise<GetHealthzResponse> => {
    return {
      status: "success",
    };
  },
);
