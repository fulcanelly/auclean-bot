import { PostComment, PostCommentInstance, PostCommentProps, PostCommentRelatedNodesI } from "./post_comment"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const postCommentStaticMethods = {
    ...baseStaticMethods
}
export const postCommentInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as PostCommentInstance
    }
};