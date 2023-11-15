import { ChannelComment, ChannelCommentInstance, ChannelCommentProps, ChannelCommentRelatedNodesI } from "./channel_comment"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const channelCommentStaticMethods = {
    ...baseStaticMethods
}
export const channelCommentInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelCommentInstance
    }
};