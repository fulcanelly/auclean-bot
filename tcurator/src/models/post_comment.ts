// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { postCommentInstanceMethods, postCommentStaticMethods } from "./post_comment_"
import { neogen } from "neogen"
import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
import { User, UserInstance, UserProps, UserRelatedNodesI } from "./user"
export type PostCommentInstance = NeogmaInstance<PostCommentProps, PostCommentRelatedNodesI, typeof postCommentInstanceMethods>

export type PostCommentProps = {
    message_id: number
}

export interface PostCommentRelatedNodesI {
    to_post: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
    authored_by: ModelRelatedNodesI<typeof User, UserInstance>
    replied_to: ModelRelatedNodesI<typeof PostComment, PostCommentInstance>
    replies: ModelRelatedNodesI<typeof PostComment, PostCommentInstance>
}

export const PostComment = ModelFactory<PostCommentProps, PostCommentRelatedNodesI, typeof postCommentStaticMethods, typeof postCommentInstanceMethods>({
    methods: postCommentInstanceMethods,
    statics: postCommentStaticMethods,
    label: "PostComment",
    schema: {
        message_id: { type: "number" }
    }
}, neogen.get())
;