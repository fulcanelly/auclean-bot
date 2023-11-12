// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { User, UserInstance, UserProps, UserRelatedNodesI } from "./user"
import { OnlineLog, OnlineLogInstance, OnlineLogProps, OnlineLogRelatedNodesI } from "./online_log"
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