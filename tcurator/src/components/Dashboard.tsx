"use client";
import { SubscriberChart } from './SubscriberChart';
import * as subs from './SubscriberChart';
import * as profile from './ProfileCard';
import * as posts from './PostsPerDayChart';

import { EngagementChart } from './EngagementChart';
import { ProfileCard } from './ProfileCard';
import { PostsPerDayChart } from './PostsPerDayChart';
import { AverageReachChart } from './AverageReachChart';


export namespace ui {
  export type SubscribersInfo = subs.ui.SubsribersInfo
  export type ChannelInfo = profile.ui.ChannelInfo
  export type PostsPerDay = posts.ui.PostsPerDay

  export type ChannelDashboardParams = {
    posts_per_day: PostsPerDay
    subs_per_day: SubscribersInfo
    channel_info: ChannelInfo
  }
}

export function Dashboard(params: ui.ChannelDashboardParams) {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <ProfileCard info={params.channel_info} />
        </div>
        <div className="md:col-span-1">
          <SubscriberChart subscribers={params.subs_per_day} />
        </div>
        <div className="md:col-span-1">
          <PostsPerDayChart posts={params.posts_per_day} />
        </div>
        <div className="col-span-1">
          <EngagementChart />
        </div>
        <div className="col-span-1">
          <AverageReachChart />
        </div>
      </div>
    </div>
  );
};
