import { ChatgptDialogue, ChatgptDialogueInstance, ChatgptDialogueProps, ChatgptDialogueRelatedNodesI } from "./chatgpt_dialogue"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const chatgptDialogueStaticMethods = {
    ...baseStaticMethods
}
export const chatgptDialogueInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChatgptDialogueInstance
    }
};