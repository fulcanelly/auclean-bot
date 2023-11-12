// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { sessionInstanceMethods, sessionStaticMethods } from "./session_"
import { neogen } from "neogen"
export type SessionInstance = NeogmaInstance<SessionProps, SessionRelatedNodesI, typeof sessionInstanceMethods>

export type SessionProps = {
    session_name: string
    user_id: string
    created_at: string
    uuid: string
    phone: string
}

export interface SessionRelatedNodesI {
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
        phone: { type: "string" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;