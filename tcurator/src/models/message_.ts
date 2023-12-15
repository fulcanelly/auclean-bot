import { Message, MessageInstance, MessageProps, MessageRelatedNodesI } from "./message"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const messageStaticMethods = {
    ...baseStaticMethods
}
export const messageInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as MessageInstance
    }
};