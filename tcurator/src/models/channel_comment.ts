// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelCommentInstanceMethods, channelCommentStaticMethods } from "./channel_comment_"
import { neogen } from "neogen"
export type ChannelCommentInstance = NeogmaInstance<ChannelCommentProps, ChannelCommentRelatedNodesI, typeof channelCommentInstanceMethods>

export type ChannelCommentProps = {
    message_id: number
}

export interface ChannelCommentRelatedNodesI {
}

export const ChannelComment = ModelFactory<ChannelCommentProps, ChannelCommentRelatedNodesI, typeof channelCommentStaticMethods, typeof channelCommentInstanceMethods>({
    methods: channelCommentInstanceMethods,
    statics: channelCommentStaticMethods,
    label: "ChannelComment",
    schema: {
        message_id: { type: "number" }
    }
}, neogen.get())
;