// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { postViewsInstanceMethods, postViewsStaticMethods } from "./post_views_"
import { neogen } from "neogen"
import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
export type PostViewsInstance = NeogmaInstance<PostViewsProps, PostViewsRelatedNodesI, typeof postViewsInstanceMethods>

export type PostViewsProps = {
    views: number
    date: number
    uuid: string
}

export interface PostViewsRelatedNodesI {
    of_post: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
}

export const PostViews = ModelFactory<PostViewsProps, PostViewsRelatedNodesI, typeof postViewsStaticMethods, typeof postViewsInstanceMethods>({
    methods: postViewsInstanceMethods,
    statics: postViewsStaticMethods,
    label: "PostViews",
    schema: {
        views: { type: "number" },
        date: { type: "number" },
        uuid: { type: "string" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;