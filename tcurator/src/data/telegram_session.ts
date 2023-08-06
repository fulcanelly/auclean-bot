import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma";
import { UserInstance, Users } from "./users";
import { neogma } from "../neo4j";

export namespace tg {
    export type SessionProps = {
        session_name: string,
        phone: string,
        user_id: string,
        created_at: string,
        uuid: string
    }

    export type OnlineLogInstance = NeogmaInstance<
        SessionProps,
        SessionLogRelatedNodesI
    >;

    export interface SessionLogRelatedNodesI {
        // logged_by: ModelRelatedNodesI<typeof Users, UserInstance>
    }

    export const Session = ModelFactory<SessionProps, SessionLogRelatedNodesI>(
        {
            label: 'Session',
            schema: {
                session_name: {
                    type: 'string'
                },
                user_id: {
                    type: 'string'
                },
                created_at: {
                    type: 'string',
                },
                uuid: {
                    type: 'string',
                },
                phone: {
                    type: 'string'
                }
            },
            primaryKeyField: 'uuid',
        },
        neogma,

    )


}


