import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma";
import { OnlineLog, OnlineLogInstance, OnlineLogRelatedNodesI } from "./online_log";
import { neogma } from "../neo4j";

export type UserProps = {
    name: string | undefined,
    user_id: string | undefined,
    uuid: string,
}

export interface UserRelatedNodesI {
    online_logs: ModelRelatedNodesI<typeof OnlineLog, OnlineLogInstance>
    reported: ModelRelatedNodesI<typeof OnlineLog, OnlineLogInstance>
}

export type UserInstance = NeogmaInstance<UserProps, UserRelatedNodesI>


export const Users = ModelFactory<UserProps, UserRelatedNodesI>(
    {
        label: 'User',
        schema: {
            name: {
                type: ['string', 'null'],
            },
            user_id: {
                type: 'string',
            },
            uuid: {
                type: 'string',
                required: true,
            },
        },
        primaryKeyField: 'uuid',
    },
    neogma,
);
