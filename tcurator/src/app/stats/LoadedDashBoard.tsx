import { PostsPerDayChart } from "@/components/PostsPerDayChart";
import { useEffect, useState } from "react";
import { getAvgCoverage, getChannelSubsHistory, getMostViewedPosts, getPostsPerLastDays } from "./loadNededData";
import { ui } from "@/components/Dashboard";
import { ProfileCard } from "@/components/ProfileCard";
import { AverageReachChart } from "@/components/AverageReachChart";
import { SubscriberChart } from "@/components/SubscriberChart";
import TopPosts from "./TopPosts";
import { useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";



export function LoadedDashBoard({ channel_info }: { channel_info: ui.ChannelInfo }) {
  const searchParams = useSearchParams()
  const full = searchParams?.get('full') as string

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <ProfileCard info={channel_info} />
        </div>
        <div className="md:col-span-1">
          <LazyLoader
            load={() => getChannelSubsHistory(channel_info.id)}
            producer={it => <SubscriberChart subscribers={it} />}
          />
        </div>
        <div className="md:col-span-1">
          <LazyLoader
            load={() => getPostsPerLastDays(channel_info.id)}
            producer={it => <PostsPerDayChart posts={it} />}
          />
        </div>
        <div className="col-span-1">
          {/* <EngagementChart /> */}
        </div>
        <div className="col-span-1">
          <LazyLoader
            load={[2000, 1000, 500, 200, 100, 50, 25, 1].map(loss => () => getAvgCoverage(channel_info.id, loss))}
            producer={it => <AverageReachChart reach={it} />}
          />
        </div>
      </div>
      <If cond={full}>
        <LazyLoader
          load={() => getMostViewedPosts(channel_info!.id)}
          producer={it => <TopPosts views={it} username={channel_info.username} />}
        />
      </If>
    </div>
  );
};

export type DataLoader<T> = () => Promise<T>

export function LazyLoader<T>({ load, producer }: { load: DataLoader<T> | DataLoader<T>[], producer: (id: T) => React.ReactNode }) {
  const [data, setData] = useState(null as T | null)

  useEffect(() => {
    if (typeof load == 'function') {
      load().then(setData)
    }
    if (load instanceof Array) {
      load.forEach(it => it().then(setData))
    }
  }, [])

  if (data) {
    return producer(data)
  }

  const style =
    { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }

  return <div style={style}>
    <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>
  </div>
}

export function If({ cond, children }) {
  if (cond) {
    return children
  }
}
