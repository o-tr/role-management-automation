import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onServiceAccountChange = () => {
  eventEmitter.emit("serviceAccountChange");
};

export const useOnServiceAccountChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("serviceAccountChange", callback);

    return () => {
      eventEmitter.off("serviceAccountChange", callback);
    };
  }, [callback]);
};
