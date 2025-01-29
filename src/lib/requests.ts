import { styleText } from "util";

export const requests = async (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => {
  const response = await fetch(input, init);
  const method = init?.method ?? "GET";
  const url = typeof input === "string" ? input : input.toString();
  const isError = response.status >= 400;
  const text = `${styleText(
    isError ? "bgRed" : "bgGreen",
    `[${method}]`,
  )} ${url} => ${styleText(
    isError ? "red" : "green",
    `${response.status} ${response.statusText}`,
  )}`;
  if (isError) {
    console.error(text);
  } else {
    console.log(text);
  }
  return response;
};
