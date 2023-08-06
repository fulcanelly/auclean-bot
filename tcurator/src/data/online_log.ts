import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma";
import { UserInstance, Users } from "./users";
import { neogma } from "../neo4j";

export type OnlineLogProps = {
    online: boolean,
    time: string,
    uuid: string
}

export type OnlineLogInstance = NeogmaInstance<
    OnlineLogProps,
    OnlineLogRelatedNodesI
>;

export interface OnlineLogRelatedNodesI {
    belong_to: ModelRelatedNodesI<typeof Users, UserInstance>
    reported_by: ModelRelatedNodesI<typeof Users, UserInstance>
}

export const OnlineLog = ModelFactory<OnlineLogProps, OnlineLogRelatedNodesI>(
    {
        label: 'OnlineLog',
        schema: {
            online: {
                type: 'boolean',
            },
            time: {
                type: 'string',
            },
            uuid: {
                type: 'string',
            },
        },
        primaryKeyField: 'uuid',
    },
    neogma,
);
