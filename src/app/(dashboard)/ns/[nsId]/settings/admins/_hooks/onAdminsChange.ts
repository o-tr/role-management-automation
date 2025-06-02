import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onAdminsChange = () => {
  eventEmitter.emit("adminsChange");
};

export const useOnAdminsChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("adminsChange", callback);

    return () => {
      eventEmitter.off("adminsChange", callback);
    };
  }, [callback]);
};
