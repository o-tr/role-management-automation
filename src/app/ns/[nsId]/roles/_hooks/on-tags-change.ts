import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onTagsChange = () => {
  eventEmitter.emit("tagsChange");
};

export const useOnTagsChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("tagsChange", callback);

    return () => {
      eventEmitter.off("tagsChange", callback);
    };
  }, [callback]);
};
