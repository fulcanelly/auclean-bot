// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { User, UserInstance, UserProps, UserRelatedNodesI } from "./user"
import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
import { OnlineLog, OnlineLogInstance, OnlineLogProps, OnlineLogRelatedNodesI } from "./online_log"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
import { PostComment, PostCommentInstance, PostCommentProps, PostCommentRelatedNodesI } from "./post_comment"
import { PostViews, PostViewsInstance, PostViewsProps, PostViewsRelatedNodesI } from "./post_views"
import { ChannelSubs, ChannelSubsInstance, ChannelSubsProps, ChannelSubsRelatedNodesI } from "./channel_subs"
User.addRelationships({
    appears_in_posts: {
        model: ChannelPost,
        direction: "out",
        name: "USER_QUOUTED"
    }
})
ChannelPost.addRelationships({
    forward_from_user: {
        model: User,
        direction: "in",
        name: "USER_QUOUTED"
    }
})
ChannelPost.addRelationships({
    forwards: {
        model: ChannelPost,
        direction: "out",
        name: "POST_FORWARD"
    }
})
ChannelPost.addRelationships({
    forwarded_from: {
        model: ChannelPost,
        direction: "in",
        name: "POST_FORWARD"
    }
})
User.addRelationships({
    reported: {
        model: OnlineLog,
        direction: "out",
        name: "ONLINE_REPORTED_BY"
    }
})
OnlineLog.addRelationships({
    reported_by: {
        model: User,
        direction: "in",
        name: "ONLINE_REPORTED_BY"
    }
})
User.addRelationships({
    online_logs: {
        model: OnlineLog,
        direction: "out",
        name: "ONLINE_BELONS_TO"
    }
})
OnlineLog.addRelationships({
    belong_to: {
        model: User,
        direction: "in",
        name: "ONLINE_BELONS_TO"
    }
})
Channel.addRelationships({
    scan_logs: {
        model: ChannelScanLog,
        direction: "out",
        name: "CHANNEL_SCAN_LOGS"
    }
})
ChannelScanLog.addRelationships({
    of_channel: {
        model: Channel,
        direction: "in",
        name: "CHANNEL_SCAN_LOGS"
    }
})
Channel.addRelationships({
    posts: {
        model: ChannelPost,
        direction: "out",
        name: "POST_OF"
    }
})
ChannelPost.addRelationships({
    of_channel: {
        model: Channel,
        direction: "in",
        name: "POST_OF"
    }
})
ChannelPost.addRelationships({
    commented: {
        model: PostComment,
        direction: "out",
        name: "POST_COMMENTED"
    }
})
PostComment.addRelationships({
    to_post: {
        model: ChannelPost,
        direction: "in",
        name: "POST_COMMENTED"
    }
})
PostComment.addRelationships({
    authored_by: {
        model: User,
        direction: "out",
        name: "COMMENT_AUTHORED_BY"
    }
})
User.addRelationships({
    comments: {
        model: PostComment,
        direction: "in",
        name: "COMMENT_AUTHORED_BY"
    }
})
PostComment.addRelationships({
    replied_to: {
        model: PostComment,
        direction: "out",
        name: "COMMENT_REPLIED_TO"
    }
})
PostComment.addRelationships({
    replies: {
        model: PostComment,
        direction: "in",
        name: "COMMENT_REPLIED_TO"
    }
})
ChannelPost.addRelationships({
    view_hisotry: {
        model: PostViews,
        direction: "out",
        name: "HAD_VIEWS_AT"
    }
})
PostViews.addRelationships({
    of_post: {
        model: ChannelPost,
        direction: "in",
        name: "HAD_VIEWS_AT"
    }
})
Channel.addRelationships({
    subs_history: {
        model: ChannelSubs,
        direction: "out",
        name: "HAD_SUBS_AT"
    }
})
ChannelSubs.addRelationships({
    of_channel: {
        model: Channel,
        direction: "in",
        name: "HAD_SUBS_AT"
    }
})
Channel.addRelationships({
    added_by_log: {
        model: ChannelScanLog,
        direction: "out",
        name: "BELONGS_TO_LOG"
    }
})
ChannelPost.addRelationships({
    added_by_log: {
        model: ChannelScanLog,
        direction: "out",
        name: "BELONGS_TO_LOG"
    }
})
PostViews.addRelationships({
    added_by_log: {
        model: ChannelScanLog,
        direction: "out",
        name: "BELONGS_TO_LOG"
    }
})
User.addRelationships({
    added_by_log: {
        model: ChannelScanLog,
        direction: "out",
        name: "BELONGS_TO_LOG"
    }
})
ChannelSubs.addRelationships({
    added_by_log: {
        model: ChannelScanLog,
        direction: "out",
        name: "BELONGS_TO_LOG"
    }
})