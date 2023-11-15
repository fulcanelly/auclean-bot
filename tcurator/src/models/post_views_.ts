import { PostViews, PostViewsInstance, PostViewsProps, PostViewsRelatedNodesI } from "./post_views"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const postViewsStaticMethods = {
    ...baseStaticMethods
}
export const postViewsInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as PostViewsInstance
    }
};