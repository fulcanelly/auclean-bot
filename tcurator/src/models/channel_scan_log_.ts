import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
import { baseInstanceMethods, baseStaticMethods } from "./__base"
import { QueryBuilder, QueryRunner } from "neogma";
import { Session, SessionProps } from "./session";
import { neogma } from "../neo4j";
import { Channel, ChannelProps } from "./channel";

export const channelScanLogStaticMethods = {
    ...baseStaticMethods
}
export const channelScanLogInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelScanLogInstance
    },

    async getChannel() {
        const queryResult = await new QueryBuilder()
            .match({
                related: [
                    {
                        model: ChannelScanLog,
                        where: {
                            uuid: this.self()!.uuid
                        }
                    },
                    ChannelScanLog.getRelationshipByAlias('of_channel'),
                    {
                        model: Channel,
                        identifier: 's'
                    }
                ]
            })
            .return('s')
            .run(neogma.queryRunner);

        return Channel.buildFromRecord({
            properties: QueryRunner.getResultProperties<ChannelProps>(queryResult, 's')[0],
            labels: [
                Channel.getLabel()
            ],
        });
    },

    async getSession() {
        const queryResult = await new QueryBuilder()
            .match({
                related: [
                    {
                        model: ChannelScanLog,
                        where: {
                            uuid: this.self()!.uuid
                        }
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

        return Session.buildFromRecord({
            properties: QueryRunner.getResultProperties<SessionProps>(queryResult, 's')[0],
            labels: [
                Session.getLabel()
            ],
        });
    }
};
