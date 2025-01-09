import { EventEmitter } from "node:events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onNsChange = () => {
  eventEmitter.emit("ns-change");
};

export const useOnNsChange = (onNsChange: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("ns-change", onNsChange);
    return () => {
      eventEmitter.off("ns-change", onNsChange);
    };
  }, [onNsChange]);
};
