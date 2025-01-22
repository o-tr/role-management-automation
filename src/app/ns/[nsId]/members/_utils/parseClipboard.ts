export const parseClipboard = (e: ClipboardEvent) => {
  if (e.clipboardData?.types.includes("text/html")) {
    return parseClipboardHtml(e);
  }
  if (e.clipboardData?.types.includes("text/plain")) {
    return parseClipboardText(e);
  }
};

const parseClipboardHtml = (e: ClipboardEvent) => {
  const html = e.clipboardData?.getData("text/html");
  if (!html?.includes("<table")) return;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = doc.getElementsByTagName("tr");
  return Array.from(rows).map((row) => {
    const cells = row.getElementsByTagName("td");
    return Array.from(cells).map((cell) => cell.innerText.trim());
  });
};

const parseClipboardText = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData("text/plain");
  if (!text) return;
  const connmaCount = text.match(/,/g)?.length;
  const tabCount = text.match(/\t/g)?.length;
  if (connmaCount === undefined && tabCount === undefined) return;
  const delimiter = (connmaCount ?? 0) > (tabCount ?? 0) ? "," : "\t";
  const lines = text.split("\n");
  return lines.map((line) => {
    return line.split(delimiter).map((cell) => cell.trim());
  });
};
