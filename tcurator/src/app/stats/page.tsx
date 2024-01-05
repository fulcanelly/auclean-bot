'use client'


import { useSearchParams } from 'next/navigation'
import { getChannelInfo, } from './loadNededData'
import { LazyLoader, LoadedDashBoard } from './LoadedDashBoard'

export default async function () {
	const searchParams = useSearchParams()
	const username = searchParams?.get('username') as string

	return <LazyLoader
		load={() => getChannelInfo(username)}
		producer={info => <LoadedDashBoard channel_info={info}/>}
	/>
}
