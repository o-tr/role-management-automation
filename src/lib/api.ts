import { type NextRequest, NextResponse } from "next/server";
import { BaseException } from "./exceptions/BaseException";
import { ForbiddenException } from "./exceptions/ForbiddenException";
import { NotFoundException } from "./exceptions/NotFoundException";
import { UnauthorizedError } from "./vrchat/retry";

export const api = <
  T extends [NextRequest, { params: Record<string, string> }],
  U extends
    | { [key: string]: unknown; status: "success" }
    | { status: "error"; error: string },
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
          { status: "error", error: error.message },
          { status: error.statusCode },
        );
      }
    }
  };
};
