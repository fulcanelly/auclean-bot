"use client";
import { Chart } from 'react-google-charts';
import { optionsBase } from '@/components/optionsBase';

// Example static data

export namespace ui {
  export type SubsribersInfo = [string, number][]
}

export function SubscriberChart({ subscribers }: { subscribers: ui.SubsribersInfo }) {
  const data = [
    ['Month', 'Subscribers'],
    ...subscribers,
  ];


  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Chart
        width={'100%'}
        height={'300px'}
        chartType="AreaChart"
        loader={<div>Loading Chart</div>}
        data={data}
        options={{
          title: 'Subscribers',
          ...optionsBase,
          chartArea: { width: '70%', height: '70%' },
        }} />
    </div>
  );
};
