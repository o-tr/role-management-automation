import { z } from "zod";

export const ZColorCode = z
  .string()
  .regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid color format")
  .brand<"ColorCode">("ColorCode");
export type TColorCode = z.infer<typeof ZColorCode>;
