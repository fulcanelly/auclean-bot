import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const channelStaticMethods = {
    ...baseStaticMethods
}
export const channelInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelInstance
    }
};