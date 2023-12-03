import { neogen } from "neogen";

neogen.generateAll({ // settings
    generateBase: true,
    outputFolder: './src/models'
}, [
    { // models
        label: 'User',
        schema: {
            name: ['string', 'null'],
            user_id: ['string', 'null'],
            uuid: {
                type: 'string',
                required: true,
            },
        },
        primaryKeyField: 'uuid'
    },
    {
        label: 'Channel',
        schema: {
            id: 'number',
            title: ['string', 'null'],
            username: ['string', 'null'],
            created_at: 'number',
            channel_link: ['string', 'null'],
            need_to_scan: 'boolean',
        },
        primaryKeyField: 'id'
    },
    {
        label: 'ChannelPost',
        schema: {
            id: 'number',
            channel_id: 'number', // just in case
            grouped_id: ['number', 'null'],
            post_author: ['string', 'null'],
            uuid: 'string',
            created_at: 'number',
        },
        primaryKeyField: 'uuid'
    },
    {
        label: 'ChannelSubs',
        schema: {
            count: 'number',
            date: 'number',
            uuid: 'string',
        },
        primaryKeyField: 'uuid'
    },
    {
        label: 'PostViews',
        schema: {
            views: 'number',
            date: 'number',
            uuid: 'string',
        },
        primaryKeyField: 'uuid'
    },
    {
        label: 'PostComment',
        schema: {
            message_id: 'number'
        }
    },
    {
        label: 'ChannelScanLog',
        schema: {
            views_per_idk: 'number', //TODO

            scanned_at: 'number'
        }
    },
    {
        label: 'Session',
        schema: {
            session_name: 'string',
            user_id: 'string',
            created_at: 'string',
            uuid: 'string',
            phone: 'string'
        },
        primaryKeyField: 'uuid',
    },
    {

        label: 'OnlineLog',
        schema: {
            online: 'boolean',
            time: 'number',
            uuid: 'string',
        },
        primaryKeyField: 'uuid'
    }], { // relations

    USER_QUOUTED: {
        User: 'appears_in_posts',
        ChannelPost: 'forward_from_user',
    },
    POST_FORWARD: {
        ChannelPost: [
            'forwards', 'forwarded_from']
    },
    ONLINE_REPORTED_BY: {
        User: 'reported',
        OnlineLog: 'reported_by',
    },
    ONLINE_BELONS_TO: {
        User: 'online_logs',
        OnlineLog: 'belong_to'
    },
    CHANNEL_SCAN_LOGS: {
        Channel: 'scan_logs',
        ChannelScanLog: 'of_channel'
    },
    POST_OF: {
        Channel: 'posts',
        ChannelPost: 'of_channel'
    },
    POST_COMMENTED: {
        ChannelPost: 'commented',
        PostComment: 'to_post'
    },
    COMMENT_AUTHORED_BY: {
        PostComment: 'authored_by',
        User: 'comments'
    },
    COMMENT_REPLIED_TO: {
        PostComment: ['replied_to', 'replies']//TODO
    },
    HAD_VIEWS_AT: {
        ChannelPost: 'view_hisotry',
        PostViews: 'of_post'
    },
    HAD_SUBS_AT: {
        Channel: 'subs_history',
        ChannelSubs: 'of_channel',
    }
    // HAD_SUBS_AT: {
        // Post: 'subs_hisotry',
    // }

})
//OnlineLog ONLINE_REPORTED_BY Users reported_by reported
//OnlineLog ONLINE_BELONS_TO Users belong_to
