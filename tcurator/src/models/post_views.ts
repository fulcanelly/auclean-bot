// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { postViewsInstanceMethods, postViewsStaticMethods } from "./post_views_"
import { neogen } from "neogen"
export type PostViewsInstance = NeogmaInstance<PostViewsProps, PostViewsRelatedNodesI, typeof postViewsInstanceMethods>

export type PostViewsProps = {
    views: number
}

export interface PostViewsRelatedNodesI {
}

export const PostViews = ModelFactory<PostViewsProps, PostViewsRelatedNodesI, typeof postViewsStaticMethods, typeof postViewsInstanceMethods>({
    methods: postViewsInstanceMethods,
    statics: postViewsStaticMethods,
    label: "PostViews",
    schema: {
        views: { type: "number" }
    }
}, neogen.get())
;