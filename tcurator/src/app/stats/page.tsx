'use client'


import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { loadNededData, state, tests } from './loadNededData'
import { Dashboard } from '@/components/Dashboard'
import TopPosts from './TopPosts'

export default function () {
    const searchParams = useSearchParams()

    const username = searchParams?.get('username') as string
    const full = searchParams?.get('full')

    const [state, setState] = useState({ state: 'loading' } as state)

    useEffect(() => {
        loadNededData(username, Boolean(full)).then(setState)
    }, [])

    if (state.state == 'done') {
        const props = state.data
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
    return JSON.stringify(state)
}
