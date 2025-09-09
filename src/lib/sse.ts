// Utilities to process simple SSE-style `data: ...` chunks coming from
// Fetch response bodies. These helpers keep caller-side parsing concise.

export const processSSEChunk = <T = unknown>(
  buffer: string,
  chunk: Uint8Array,
  decoder: TextDecoder,
): { buffer: string; events: T[] } => {
  const appended = buffer + decoder.decode(chunk, { stream: true });

  const lines = appended.split("\n");
  const newBuffer = lines.pop() || "";

  const events: T[] = [];
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const jsonData = line.slice(6).trim();
    if (!jsonData) continue;
    try {
      events.push(JSON.parse(jsonData) as T);
    } catch (e) {
      // swallow parsing errors; caller may log if desired
    }
  }

  return { buffer: newBuffer, events };
};

export const processSSEFinalBuffer = <T = unknown>(buffer: string): T[] => {
  const events: T[] = [];
  if (!buffer) return events;
  const trimmed = buffer.trim();
  if (!trimmed.startsWith("data: ")) return events;
  const jsonData = trimmed.slice(6).trim();
  if (!jsonData) return events;
  try {
    events.push(JSON.parse(jsonData) as T);
  } catch (e) {
    // ignore
  }
  return events;
};
