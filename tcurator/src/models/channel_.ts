import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { baseInstanceMethods, baseStaticMethods } from "./__base"
import { neogma } from "../neo4j";
import { QueryBuilder, QueryRunner } from "neogma";
import { ChannelScanLog } from "../models/channel_scan_log";
import { Session, SessionInstance, SessionProps } from "../models/session";

export const channelStaticMethods = {
    ...baseStaticMethods
}
export const channelInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelInstance
    },

    async getSessionAddedBy(): Promise<SessionInstance | undefined> {
        const queryResult = await new QueryBuilder()
            .match({
                related: [
                    {
                        model: Channel,
                        where: {
                            id: this.self().id
                        }
                    },
                    Channel.getRelationshipByAlias('added_by_log'),
                    {
                        model: ChannelScanLog
                    },
                    ChannelScanLog.getRelationshipByAlias('handled_by'),
                    {
                        model: Session,
                        identifier: 's'
                    }
                ]
            })
            .return('s')
            .run(neogma.queryRunner);

        const session = QueryRunner.getResultProperties<SessionProps>(queryResult, 's');

        if (!session.length) {
            return;
        }
        return Session.buildFromRecord({
            properties: session[0],
            labels: [Session.getLabel()]
        })
    }

};
