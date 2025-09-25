import { type NextRequest, NextResponse } from "next/server";
import type { ErrorResponseType } from "@/types/api";
import { BaseException } from "./exceptions/BaseException";

export const api = <
  T extends [NextRequest, { params: Record<string, string> }],
  U extends { [key: string]: unknown; status: "success" } | ErrorResponseType,
>(
  func: (...args: T) => Promise<U>,
) => {
  return async (...args: T) => {
    try {
      const result = await func(...args);
      return NextResponse.json({
        ...result,
      });
    } catch (error) {
      if (error instanceof BaseException) {
        return NextResponse.json(
          { status: "error", error: error.message, code: error.statusCode },
          { status: error.statusCode },
        );
      }
      console.log(error);
      return NextResponse.json(
        { status: "error", error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
};
