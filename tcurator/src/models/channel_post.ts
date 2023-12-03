// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelPostInstanceMethods, channelPostStaticMethods } from "./channel_post_"
import { neogen } from "neogen"
import { User, UserInstance, UserProps, UserRelatedNodesI } from "./user"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { PostComment, PostCommentInstance, PostCommentProps, PostCommentRelatedNodesI } from "./post_comment"
import { PostViews, PostViewsInstance, PostViewsProps, PostViewsRelatedNodesI } from "./post_views"
export type ChannelPostInstance = NeogmaInstance<ChannelPostProps, ChannelPostRelatedNodesI, typeof channelPostInstanceMethods>

export type ChannelPostProps = {
    id: number
    channel_id: number
    grouped_id?: number | undefined
    post_author?: string | undefined
    uuid: string
    created_at: number
}

export interface ChannelPostRelatedNodesI {
    forward_from_user: ModelRelatedNodesI<typeof User, UserInstance>
    forwards: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
    forwarded_from: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
    of_channel: ModelRelatedNodesI<typeof Channel, ChannelInstance>
    commented: ModelRelatedNodesI<typeof PostComment, PostCommentInstance>
    view_hisotry: ModelRelatedNodesI<typeof PostViews, PostViewsInstance>
}

export const ChannelPost = ModelFactory<ChannelPostProps, ChannelPostRelatedNodesI, typeof channelPostStaticMethods, typeof channelPostInstanceMethods>({
    methods: channelPostInstanceMethods,
    statics: channelPostStaticMethods,
    label: "ChannelPost",
    schema: {
        id: { type: "number" },
        channel_id: { type: "number" },
        grouped_id: { type: ["number", "null"] },
        post_author: { type: ["string", "null"] },
        uuid: { type: "string" },
        created_at: { type: "number" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;