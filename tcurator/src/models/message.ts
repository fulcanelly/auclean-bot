// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { messageInstanceMethods, messageStaticMethods } from "./message_"
import { neogen } from "neogen"
export type MessageInstance = NeogmaInstance<MessageProps, MessageRelatedNodesI, typeof messageInstanceMethods>

export type MessageProps = {
    id: number
    date: number
    text?: undefined | string
}

export interface MessageRelatedNodesI {
}

export const Message = ModelFactory<MessageProps, MessageRelatedNodesI, typeof messageStaticMethods, typeof messageInstanceMethods>({
    methods: messageInstanceMethods,
    statics: messageStaticMethods,
    label: "Message",
    schema: {
        id: { type: "number" },
        date: { type: "number" },
        text: { type: ["null", "string"] }
    }
}, neogen.get())
;