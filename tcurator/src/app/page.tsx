"use client"


import { Dashboard, ui } from '../components/Dashboard';

// TODO: REMOVE

const fakePosts: ui.PostsPerDay = [
  ['Mon', 4],
  ['Tue', 8],
  ['Wed', 2],
  ['Thu', 5],
  ['Fri', 7],
  ['Sat', 3],
  ['Sun', 6],
]


const fakeSubs: ui.SubscribersInfo = [
  ['Jan', 0],
  ['Feb', 10],
  ['Mar', 23],
  ['Apr', 17],
  ['May', 18],
  ['Jun', 9],
  ['Jul', 11],
  ['Aug', 27],
]

const fakeInfo: ui.ChannelInfo = {
  category: 'Music',
  username: '@qweyres',
  country: 'Ukraine',
  ageDays: 2,
  postsCount: 1,
  id: null,
}

export default function Home() {
  return <Dashboard posts_per_day={fakePosts} subs_per_day={fakeSubs} channel_info={fakeInfo}></Dashboard>
}
