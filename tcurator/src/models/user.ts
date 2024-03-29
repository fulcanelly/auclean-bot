// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { userInstanceMethods, userStaticMethods } from "./user_"
import { neogen } from "neogen"
import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
import { OnlineLog, OnlineLogInstance, OnlineLogProps, OnlineLogRelatedNodesI } from "./online_log"
import { PostComment, PostCommentInstance, PostCommentProps, PostCommentRelatedNodesI } from "./post_comment"
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
export type UserInstance = NeogmaInstance<UserProps, UserRelatedNodesI, typeof userInstanceMethods>

export type UserProps = {
    name?: string | undefined
    user_id?: string | undefined
    uuid: string
}

export interface UserRelatedNodesI {
    appears_in_posts: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
    reported: ModelRelatedNodesI<typeof OnlineLog, OnlineLogInstance>
    online_logs: ModelRelatedNodesI<typeof OnlineLog, OnlineLogInstance>
    comments: ModelRelatedNodesI<typeof PostComment, PostCommentInstance>
    added_by_log: ModelRelatedNodesI<typeof ChannelScanLog, ChannelScanLogInstance>
}

export const User = ModelFactory<UserProps, UserRelatedNodesI, typeof userStaticMethods, typeof userInstanceMethods>({
    methods: userInstanceMethods,
    statics: userStaticMethods,
    label: "User",
    schema: {
        name: { type: ["string", "null"] },
        user_id: { type: ["string", "null"] },
        uuid: {
            type: "string",
            required: true
        }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;