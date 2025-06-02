import NextImage from "next/image";
import type { ComponentProps, FC, ReactEventHandler } from "react";
import { useCallback, useState } from "react";

type ExtendedImageProps = ComponentProps<typeof NextImage> & {
  onRetryRefresh?: () => Promise<string | undefined>;
  retryOnError?: boolean;
};

export const Image: FC<ExtendedImageProps> = ({ ...props }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback<ReactEventHandler<HTMLImageElement>>(
    async (error) => {
      props.onError?.(error);
      setHasError(true);
    },
    [props.onError],
  );

  // Show fallback when error occurs and no retry is possible
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 text-xs ${
          props.className || ""
        }`}
        style={{
          width: props.width || 24,
          height: props.height || 24,
          borderRadius: props.className?.includes("rounded-full")
            ? "50%"
            : undefined,
        }}
      >
        ?
      </div>
    );
  }

  const imageProps = {
    ...props,
    onError: handleError,
  };

  if (
    typeof props.src === "string" &&
    (props.src.startsWith("https://api.vrchat.cloud") ||
      props.src.startsWith("https://assets.vrchat.com"))
  ) {
    return <NextImage {...imageProps} unoptimized />;
  }
  return <NextImage {...imageProps} />;
};
