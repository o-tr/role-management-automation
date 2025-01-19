// original : https://zenn.dev/odiak/articles/0b963664a4f8cd
import { z } from "zod";

const key = Symbol();
type Self = { [key]: string };

type ReplaceSelf<T, TT extends [unknown]> = T extends Self
  ? TT[0]
  : // biome-ignore lint/complexity/noBannedTypes: ユーティリティなので無視
    T extends {}
    ? { [K in keyof T]: ReplaceSelf<T[K], TT> }
    : T;

export function zodRecursive<T>(
  builder: (self: z.Schema<Self>) => z.Schema<T>,
) {
  type R = ReplaceSelf<T, [R]>;
  const builder_ = builder as unknown as (self: z.Schema<R>) => z.Schema<R>;

  const rec = (): z.Schema<R> => builder_(z.lazy(rec));
  return rec();
}
