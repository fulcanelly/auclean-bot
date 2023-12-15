import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const channelPostStaticMethods = {
    ...baseStaticMethods
}
export const channelPostInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelPostInstance
    }
};