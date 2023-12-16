'use client'

import { Dashboard, ui } from "@/components/Dashboard";
import { Channel } from "@/models/channel";
import '@/app/globals.css'


type Props = ui.ChannelDashboardParams & { null: false } | { null: true }

export async function getServerSideProps(context: any): Promise<{ props: Props }> {
    const username = context.query.username

    if (!username) {
        return { props: { null: true } }
    }

    const ch = await Channel.findOne({
        where: {
            username: username
        }
    })

    if (!ch) {
        return { props: { null: true } }
    }

    const channel = Channel.buildFromRecord({
        properties: ch!,
        labels: [Channel.getLabel()]
    })

    const postsPerDay = await channel.getPostsPerLastDays()

    const channel_info = {
        category: "",
        username: ch.username ?? ch.title!,
        country: "",
        ageDays: 0,
        postsCount: 0
    }

    return {
        props: {
            null: false,
            posts_per_day: postsPerDay,
            subs_per_day: [['a', 1]],
            channel_info

        }


    }

};

export default function(props: Props) {
    if (props.null) {
        return 'not found'
    }

    return <Dashboard
        posts_per_day={props.posts_per_day}
        subs_per_day={props.subs_per_day}
        channel_info={props.channel_info}>
    </Dashboard>

}
