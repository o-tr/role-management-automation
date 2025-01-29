import { api } from "@/lib/api";
import type { NextRequest, NextResponse } from "next/server";

export type GetHealthzResponse = {
  status: "success";
};

export const GET = api(
  async (req: NextRequest): Promise<GetHealthzResponse> => {
    return {
      status: "success",
    };
  },
);
