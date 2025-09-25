import { api } from "@/lib/api";
import type { NextRequest } from "next/server";

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
