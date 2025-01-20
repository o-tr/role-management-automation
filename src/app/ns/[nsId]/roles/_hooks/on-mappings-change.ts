import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onServiceGroupMappingChange = () => {
  eventEmitter.emit("serviceGroupMappingChange");
};

export const useOnServiceGroupMappingChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("serviceGroupMappingChange", callback);

    return () => {
      eventEmitter.off("serviceGroupMappingChange", callback);
    };
  }, [callback]);
};
