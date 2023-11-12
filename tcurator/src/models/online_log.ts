// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { onlineLogInstanceMethods, onlineLogStaticMethods } from "./online_log_"
import { neogen } from "neogen"
import { User, UserInstance, UserProps, UserRelatedNodesI } from "./user"
export type OnlineLogInstance = NeogmaInstance<OnlineLogProps, OnlineLogRelatedNodesI, typeof onlineLogInstanceMethods>

export type OnlineLogProps = {
    online: boolean
    time: number
    uuid: string
}

export interface OnlineLogRelatedNodesI {
    reported_by: ModelRelatedNodesI<typeof User, UserInstance>
    belong_to: ModelRelatedNodesI<typeof User, UserInstance>
}

export const OnlineLog = ModelFactory<OnlineLogProps, OnlineLogRelatedNodesI, typeof onlineLogStaticMethods, typeof onlineLogInstanceMethods>({
    methods: onlineLogInstanceMethods,
    statics: onlineLogStaticMethods,
    label: "OnlineLog",
    schema: {
        online: { type: "boolean" },
        time: { type: "number" },
        uuid: { type: "string" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;