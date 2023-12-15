import { Session, SessionInstance, SessionProps, SessionRelatedNodesI } from "./session"
import { baseInstanceMethods, baseStaticMethods } from "./__base"
import { QueryBuilder } from "neogma";
import { ChannelScanLog } from "./channel_scan_log";
import { neogma } from "../neo4j";

export const sessionStaticMethods = {
    ...baseStaticMethods
}
export const sessionInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as SessionInstance
    },

    async isBussy() {
        const result = await new QueryBuilder()
            .match({
                related: [
                    {
                        model: Session,
                        where: {
                            uuid: this.self().uuid,
                        }
                    },
                    Session.getRelationshipByAlias('scan_logs'),
                    {
                        model: ChannelScanLog,
                        identifier: 'a',
                        where: {
                            status: 'RUNNING'
                        }
                    },

                ]
            })
            .return('count(a) as c')
            .run(neogma.queryRunner)

	    return Boolean(Number(result.records[0].get('c')))
    }
};
