import { User, UserInstance, UserProps, UserRelatedNodesI } from "./user";
import { baseInstanceMethods, baseStaticMethods } from "./__base";
export const userStaticMethods = { ...baseStaticMethods };
export const userInstanceMethods = { ...baseInstanceMethods, self() {
        return this as any as UserInstance;
    } };