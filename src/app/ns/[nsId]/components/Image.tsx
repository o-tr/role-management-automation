import NextImage from "next/image";
import type { ComponentProps, FC } from "react";

export const Image: FC<ComponentProps<typeof NextImage>> = (props) => {
  if (
    typeof props.src === "string" &&
    props.src.startsWith("https://api.vrchat.cloud")
  ) {
    return <NextImage {...props} unoptimized />;
  }
  return <NextImage {...props} />;
};
