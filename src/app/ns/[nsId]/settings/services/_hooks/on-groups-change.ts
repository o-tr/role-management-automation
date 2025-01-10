import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onServiceGroupChange = () => {
  eventEmitter.emit("serviceGroupChange");
};

export const useOnServiceGroupChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("serviceGroupChange", callback);

    return () => {
      eventEmitter.off("serviceGroupChange", callback);
    };
  }, [callback]);
};
