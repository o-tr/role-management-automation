import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onMemberChange = () => {
  eventEmitter.emit("membersChange");
};

export const useOnMemberChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("membersChange", callback);

    return () => {
      eventEmitter.off("membersChange", callback);
    };
  }, [callback]);
};
