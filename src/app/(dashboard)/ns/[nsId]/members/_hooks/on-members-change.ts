import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onMembersChange = () => {
  eventEmitter.emit("membersChange");
};

export const useOnMembersChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("membersChange", callback);

    return () => {
      eventEmitter.off("membersChange", callback);
    };
  }, [callback]);
};
