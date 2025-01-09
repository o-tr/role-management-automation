type Brand<K, T> = K & { __brand: T };

export type GroupId = Brand<string, "GroupId">;
