'use server';

import { ui } from '@/components/Dashboard';
import { Channel } from '@/models/channel';
import '@/models/__relations'
import { duration } from 'moment';
import { QueryBuilder } from 'neogma';
import { ChannelSubs } from '@/models/channel_subs';
import { neogma } from '@/neo4j';
import { recordToObject } from '@/utils/record_to_object';

export type Data = {
    most_viewed: { post_id: number, views: number }[] | undefined
} & ui.ChannelDashboardParams

export type state
    = { state: 'need_username' }
    | { state: 'loading' }
    | { state: 'not_found' }
    | {
        state: 'done',
        data: Data
    }


export async function getMostViewedPosts(id) {
    return await findChannel(id).then(it => it!.getMostViewedPosts(10, 30))
}

export async function findChannel(id) {
    return await Channel.findOne({
        where: {
            id
        }
    })
}
export async function getAvgCoverage(id: number, loss: number) {
    const channel = await Channel.findOne({
        where: {
            id
        }
    })

    const avgs = await channel!.getAvgCoverage(
        duration(1, 'hour'),
        duration(3, 'days'),
        loss
    )

    return avgs.map(i => [
        i.date.toUTCString(),
        i.avg,
        i.coverage,
    ] as [string, number, number])
}

export async function getChannelSubsHistory(id: number): Promise<[string, number][]> {
    const channel = await Channel.findOne({
        where: {
            id
        }
    })

    const result = await new QueryBuilder()
        .match({
            related: [
                {
                    model: Channel,
                    where: channel!.dataValues
                },
                Channel.getRelationshipByAlias('subs_history'),
                {
                    model: ChannelSubs,
                    identifier: 'subs'
                }
            ]
        })
        .return('subs.date as date, subs.count as count')
        .orderBy('date')
        .run(neogma.queryRunner)

    return result.records.map(recordToObject<{ date: number, count: number }>)
        .map(({date, count}) => [new Date(date * 1000).toISOString(), count])
}

export async function getChannelInfo(username: string): Promise<ui.ChannelInfo> {
    const channel = await Channel.findOne({
        where: {
            username
        }
    })

    if (!channel) {
        throw 'no channel'
    }

    return {
        id: channel.id,
        category: "",
        username: channel.username ?? channel.title!,
        country: "",
        ageDays: 0,
        postsCount: 0
    }
}

export async function getPostsPerLastDays(id: number) {
    const channel = await Channel.findOne({
        where: {
            id
        }
    })

    return channel!.getPostsPerLastDays()
}
