import { OnlineLog } from "./online_log"
import { Users } from "./users"



OnlineLog.addRelationships({
    belong_to: {
        model: Users,
        direction: 'in',
        name: 'ONLINE_BELONS_TO',
    },
    reported_by: {
        model: Users,
        direction: 'in',
        name: 'ONLINE_REPORTED_BY'
    }
})

Users.addRelationships({
    online_logs: {
        model: OnlineLog,
        direction: 'out',
        name: 'ONLINE_BELONS_TO'
    },

    reported: {
        model: OnlineLog,
        direction: 'out',
        name: 'ONLINE_REPORTED_BY'
    }
})
