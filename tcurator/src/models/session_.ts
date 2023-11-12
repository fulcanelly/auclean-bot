import { Session, SessionInstance, SessionProps, SessionRelatedNodesI } from "./session";
import { baseInstanceMethods, baseStaticMethods } from "./__base";
export const sessionStaticMethods = { ...baseStaticMethods };
export const sessionInstanceMethods = { ...baseInstanceMethods, self() {
        return this as any as SessionInstance;
    } };