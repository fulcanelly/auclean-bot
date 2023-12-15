import { neogen } from "neogen";

const scanLogRelations: neogen.Relation[]
    = [
        'Channel',
        'ChannelPost',
        'PostViews',
        'User',
        'ChannelSubs'
    ].map(from => {
        return {
            from,
            to: 'ChannelScanLog',
            direction: 'out',
            alias: 'added_by_log',
            label: 'BELONGS_TO_LOG',
        }
    })

neogen.generateAll({ // settings
    generateBase: true,
    outputFolder: './src/models',
    rawRelation: scanLogRelations
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
            is_public: ['boolean', 'null'],
            title: ['string', 'null'],
            username: ['string', 'null'],
            created_at: ['number', 'null'],
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
            uuid: 'string',
            enrolled_at: 'number',
            started_at: 'number',
            finished_at: 'number',
            request: 'string',
            status: 'string',
            //request

            //scan
            //successs
        },
        primaryKeyField: 'uuid'
    },
    {
        label: 'Session',
        schema: {
            session_name: 'string',
            user_id: 'string',
            created_at: 'string',
            uuid: 'string',
            phone: 'string',
            password2factor: ['string', 'null'],
            type: ['string', 'null']
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
    SCANNED_FOR: {
        ChannelScanLog: 'of_channel',
        Channel: 'scan_logs',
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
    },
    HANDLED_BY: {
        ChannelScanLog: 'handled_by',
        Session: 'scan_logs'
    }
    // HAD_SUBS_AT: {
    // Post: 'subs_hisotry',
    // }

})
//OnlineLog ONLINE_REPORTED_BY Users reported_by reported
//OnlineLog ONLINE_BELONS_TO Users belong_to
