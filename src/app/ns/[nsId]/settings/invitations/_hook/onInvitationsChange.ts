import EventEmitter from "events";
import { useLayoutEffect } from "react";

const eventEmitter = new EventEmitter();

export const onInvitationsChange = () => {
  eventEmitter.emit("invitationsChange");
};

export const useOnInvitationsChange = (callback: () => void) => {
  useLayoutEffect(() => {
    eventEmitter.on("invitationsChange", callback);

    return () => {
      eventEmitter.off("invitationsChange", callback);
    };
  }, [callback]);
};
