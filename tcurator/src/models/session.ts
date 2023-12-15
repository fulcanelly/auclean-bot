// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { sessionInstanceMethods, sessionStaticMethods } from "./session_"
import { neogen } from "neogen"
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
export type SessionInstance = NeogmaInstance<SessionProps, SessionRelatedNodesI, typeof sessionInstanceMethods>

export type SessionProps = {
    session_name: string
    user_id: string
    created_at: string
    uuid: string
    phone: string
    password2factor?: string | undefined
    type?: string | undefined
}

export interface SessionRelatedNodesI {
    scan_logs: ModelRelatedNodesI<typeof ChannelScanLog, ChannelScanLogInstance>
}

export const Session = ModelFactory<SessionProps, SessionRelatedNodesI, typeof sessionStaticMethods, typeof sessionInstanceMethods>({
    methods: sessionInstanceMethods,
    statics: sessionStaticMethods,
    label: "Session",
    schema: {
        session_name: { type: "string" },
        user_id: { type: "string" },
        created_at: { type: "string" },
        uuid: { type: "string" },
        phone: { type: "string" },
        password2factor: { type: ["string", "null"] },
        type: { type: ["string", "null"] }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;