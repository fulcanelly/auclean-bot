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
            name: ['string', 'null'],
            channel_link: ['string',],
            need_to_scan: 'boolean',
            uuid: {
                type: 'string',
                required: true,
            },
            channel_id: 'string'
        },
        primaryKeyField: 'uuid'
    },
    {
        label: 'ChannelPost',
        schema: {
            message_id: 'string',
            channel_id: 'string' // just in case
        }
    },
    {
        label: 'PostViews',
        schema: {
            views: 'number'
        }
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
    }
})
//OnlineLog ONLINE_REPORTED_BY Users reported_by reported
//OnlineLog ONLINE_BELONS_TO Users belong_to
