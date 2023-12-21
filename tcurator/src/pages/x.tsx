'use client'

import { Dashboard, ui } from "@/components/Dashboard";
import { Channel } from "@/models/channel";
import '@/app/globals.css'
import { useRouter } from "next/router";
import TopPosts from "./TopPosts";


type Props = { most_viewed: null | { post_id: number, views: number }[] } & ui.ChannelDashboardParams & { null: false } | { null: true }

export default function (props: Props) {
    const router = useRouter()
    const { full } = router.query

    if (props.null) {
        return 'not found'
    }

    if (full) {
        return <>
            <Dashboard
                posts_per_day={props.posts_per_day}
                subs_per_day={props.subs_per_day}
                channel_info={props.channel_info}>
            </Dashboard>
            <TopPosts
                views={props.most_viewed}
                username={props.channel_info.username}
            >
            </TopPosts>
        </>
    }

    return <Dashboard
        posts_per_day={props.posts_per_day}
        subs_per_day={props.subs_per_day}
        channel_info={props.channel_info}>
    </Dashboard>
}

export async function getServerSideProps(context: any): Promise<{ props: Props }> {
    const username = context.query.username
    const full: boolean = context.query.full

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

    const [postsPerDay, mostViewed]
        = await Promise.all([
            channel.getPostsPerLastDays(),
            full ? channel.getMostViewedPosts(10, 30) : undefined
        ])

    const channel_info = {
        category: "",
        username: ch.username ?? ch.title!,
        country: "",
        ageDays: 0,
        postsCount: 0
    }

    const props: Props = {
        most_viewed: mostViewed ?? null,
        null: false,
        posts_per_day: postsPerDay,
        subs_per_day: [['a', 1]],
        channel_info,
    }

    return {
        props
    }
};
