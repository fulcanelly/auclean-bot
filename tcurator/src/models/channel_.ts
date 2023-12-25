import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { baseInstanceMethods, baseStaticMethods } from "./__base"
import { FixedQueryBuilder } from "../utils/fixed_query_builder";
import { neogma } from "../neo4j";
import { BindParam, QueryBuilder, QueryRunner } from "neogma";
import { ChannelScanLog } from "../models/channel_scan_log";
import { Session, SessionInstance, SessionProps } from "../models/session";
import { ChannelPost } from "./channel_post";
import { Date, Integer } from "neo4j-driver";
import { queires } from "../queries/all";
import { recordToObject } from "../utils/record_to_object";
import moment from 'moment';


export const channelStaticMethods = {
    ...baseStaticMethods,

    async findNotScannedFor(time: moment.Duration): Promise<ChannelInstance | undefined> {
        const params = new BindParam({
            noScansFrom: moment().subtract(time).unix(),
            limit: Integer.fromNumber(1)
        })

        const result = await new QueryBuilder(params)
            .raw(await queires.notScanedFor())
            .run(neogma.queryRunner)

        return result.records.map(recordToObject)
            .map(it => it.c)
            .map(Channel.buildFromRecord)[0]
    }
}

export const channelInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelInstance
    },

    async getChannelAddedBy() {
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
                    ChannelScanLog.getRelationshipByAlias('of_channel'),
                    {
                        model: Channel,
                        identifier: 'c'
                    }
                ]
            }
            )
            .return('c')
            .run(neogma.queryRunner);


        const channel = QueryRunner.getResultProperties<ChannelProps>(queryResult, 'c');

        if (!channel.length) {
            return;
        }

        return Channel.buildFromRecord({
            properties: channel[0],
            labels: [Session.getLabel()]
        })
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
    },


    /**
     *
     *
     *
     *
     *
     *
     * Query example:


        WITH range(0, 10) AS daysAgoList
        UNWIND daysAgoList AS daysAgo
        WITH date() - duration({days: daysAgo}) AS targetDay

        MATCH (c:Channel {username: 'sadamekamusic'})
        OPTIONAL MATCH (c)-[]-(p:ChannelPost)
        WHERE date(datetime({epochSeconds:toInteger(p.created_at) })) >= targetDay
        AND  date(datetime({epochSeconds:toInteger(p.created_at) })) < targetDay + duration({days: 1})

        RETURN date(targetDay) AS Day,
            count(p) AS PostCount
        ORDER BY Day DESC

     *
     */


    async getPostsPerLastDays(days: number = 30) {
        const params = new BindParam({ days })
        const result = await new FixedQueryBuilder(params)
            .with(`range(0, $days) AS daysAgoList`)
            .unwind({
                value: 'daysAgoList',
                as: 'daysAgo'
            })
            .with('date() - duration({days: daysAgo}) AS targetDay')
            .match({
                model: Channel,
                where: {
                    id: this.self().id,
                },
                identifier: 'c'
            })
            .match({
                optional: true,
                related: [
                    { identifier: 'c' },
                    Channel.getRelationshipByAlias('posts'),
                    {
                        model: ChannelPost,
                        identifier: 'p'
                    }
                ]
            })
            .where('date(datetime({epochSeconds:toInteger(p.created_at) })) = targetDay')
            .return(['date(targetDay) AS Day', 'count(p) AS PostCount'])
            .orderBy({
                direction: 'DESC',
                identifier: 'Day'
            })
            .run(neogma.queryRunner)


        type PostsPerDayResultT = { _fields: [Date, Integer] }
        return result.records.map(it => it as any as PostsPerDayResultT).map(({ _fields: [date, count] }) => [
            date.toStandardDate().toLocaleDateString(),
            Integer.toNumber(count)
        ]) as [string, number][]
    },

    async getMostViewedPosts(limit: number = 10, daysAgo?: number | undefined): Promise<{ post_id: number, views: number }[]> {
        const params = new BindParam({
            id: this.self().id,
            limit: Integer.fromNumber(limit),
            startDate: Integer.fromNumber(daysAgo ? moment().subtract(daysAgo, 'days').toDate().getTime() / 1000 : -1)
        })

        const result = await new QueryBuilder(params)
            .raw(await queires.topPopularPosts())
            .run(neogma.queryRunner)

        return result.records.map(recordToObject)
    }

}
