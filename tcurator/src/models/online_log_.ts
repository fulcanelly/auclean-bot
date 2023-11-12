import { OnlineLog, OnlineLogInstance, OnlineLogProps, OnlineLogRelatedNodesI } from "./online_log";
import { baseInstanceMethods, baseStaticMethods } from "./__base";
export const onlineLogStaticMethods = { ...baseStaticMethods };
export const onlineLogInstanceMethods = { ...baseInstanceMethods, self() {
        return this as any as OnlineLogInstance;
    } };