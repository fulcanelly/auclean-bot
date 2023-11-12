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
        label: 'Session',
        schema: {
            session_name: 'string',
            user_id: 'string',
            created_at: 'string',
            uuid: 'string',
            phone: 'string'
        },
        primaryKeyField: 'uuid',
    }

     ,{
        label: 'OnlineLog',
        schema: {
            online: 'boolean',
            time: 'string',
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
    }
})
//OnlineLog ONLINE_REPORTED_BY Users reported_by reported
//OnlineLog ONLINE_BELONS_TO Users belong_to
