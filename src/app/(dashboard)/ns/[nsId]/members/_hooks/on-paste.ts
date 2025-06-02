import { useLayoutEffect } from "react";

export const useOnPaste = (callback: (event: ClipboardEvent) => void) => {
  useLayoutEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      callback(event);
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [callback]);
};
