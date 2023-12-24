'use server';

import { ui } from '@/components/Dashboard';
import { Channel, ChannelInstance } from '@/models/channel';
import '@/models/__relations'
import _ from 'lodash';

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


export async function tests(): Promise<Object> {
    return 9
}

export async function loadNededData(username: string, full: boolean): Promise<state> {

    if (!username) {
        return { state: 'need_username' }
    }

    const channel = await Channel.findOne({
        where: {
            username: username
        }
    })

    if (!channel) {
        return { state: 'not_found' }
    }

    // console.log(await optimizedGetPostPerLastDays(channel))

    const [postsPerDay, mostViewed]
        = await Promise.all([
            // channel.getPostsPerLastDays(),
            optimizedGetPostPerLastDays(channel),
            full ? channel.getMostViewedPosts(10, 30) : undefined
        ])

    const channel_info = {
        category: "",
        username: channel.username ?? channel.title!,
        country: "",
        ageDays: 0,
        postsCount: 0
    }

    return {
        state: 'done',
        data: {
            most_viewed: mostViewed,
            posts_per_day: postsPerDay,
            subs_per_day: [['a', 1]],
            channel_info,
        }
    }

};


const optimizedGetPostPerLastDays = (channel: ChannelInstance) => Promise.all(new Array(30).fill(null).map((_, i) => channel.getPostAtDayAgo(i)))

