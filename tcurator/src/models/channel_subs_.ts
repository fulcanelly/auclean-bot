import { ChannelSubs, ChannelSubsInstance, ChannelSubsProps, ChannelSubsRelatedNodesI } from "./channel_subs"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const channelSubsStaticMethods = {
    ...baseStaticMethods
}
export const channelSubsInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelSubsInstance
    }
};