"use client";
import { Chart } from 'react-google-charts';
import { optionsBase } from '@/components/optionsBase';


export namespace ui {
  export type PostsPerDay = [string, number][]
}

export function PostsPerDayChart({ posts } : { posts: ui.PostsPerDay }) {
  const data = [
    ['Day', 'Posts'],
    ...posts
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Chart
        width={'100%'}
        height={'300px'}
        chartType="ColumnChart"
        loader={<div>Loading Chart</div>}
        data={data}
        options={{
          title: 'Posts per Day',
          ...optionsBase,
          chartArea: { width: '70%', height: '70%' },
        }} />
    </div>
  );
};
