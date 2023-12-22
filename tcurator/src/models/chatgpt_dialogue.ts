// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { chatgptDialogueInstanceMethods, chatgptDialogueStaticMethods } from "./chatgpt_dialogue_"
import { neogen } from "neogen"
export type ChatgptDialogueInstance = NeogmaInstance<ChatgptDialogueProps, ChatgptDialogueRelatedNodesI, typeof chatgptDialogueInstanceMethods>

export type ChatgptDialogueProps = {
    id: number
    session_id: number
    text: string
    role: string
    date: number
}

export interface ChatgptDialogueRelatedNodesI {
}

export const ChatgptDialogue = ModelFactory<ChatgptDialogueProps, ChatgptDialogueRelatedNodesI, typeof chatgptDialogueStaticMethods, typeof chatgptDialogueInstanceMethods>({
    methods: chatgptDialogueInstanceMethods,
    statics: chatgptDialogueStaticMethods,
    label: "ChatgptDialogue",
    schema: {
        id: { type: "number" },
        session_id: { type: "number" },
        text: { type: "string" },
        role: { type: "string" },
        date: { type: "number" }
    },
    primaryKeyField: "id"
}, neogen.get())
;