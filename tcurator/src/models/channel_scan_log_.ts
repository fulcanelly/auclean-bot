import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
import { baseInstanceMethods, baseStaticMethods } from "./__base"
import { QueryBuilder, QueryRunner } from "neogma";
import { Session, SessionProps } from "./session";
import { neogma } from "../neo4j";

export const channelScanLogStaticMethods = {
    ...baseStaticMethods
}
export const channelScanLogInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelScanLogInstance
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
