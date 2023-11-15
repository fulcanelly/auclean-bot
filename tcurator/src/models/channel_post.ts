// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelPostInstanceMethods, channelPostStaticMethods } from "./channel_post_"
import { neogen } from "neogen"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { PostComment, PostCommentInstance, PostCommentProps, PostCommentRelatedNodesI } from "./post_comment"
export type ChannelPostInstance = NeogmaInstance<ChannelPostProps, ChannelPostRelatedNodesI, typeof channelPostInstanceMethods>

export type ChannelPostProps = {
    message_id: string
    channel_id: string
}

export interface ChannelPostRelatedNodesI {
    of_channel: ModelRelatedNodesI<typeof Channel, ChannelInstance>
    commented: ModelRelatedNodesI<typeof PostComment, PostCommentInstance>
}

export const ChannelPost = ModelFactory<ChannelPostProps, ChannelPostRelatedNodesI, typeof channelPostStaticMethods, typeof channelPostInstanceMethods>({
    methods: channelPostInstanceMethods,
    statics: channelPostStaticMethods,
    label: "ChannelPost",
    schema: {
        message_id: { type: "string" },
        channel_id: { type: "string" }
    }
}, neogen.get())
;