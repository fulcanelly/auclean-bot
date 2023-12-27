"use client";
import { Chart } from 'react-google-charts';
import { optionsBase } from '@/components/optionsBase';


type Reach = [string, number, number][]
export const AverageReachChart = ({reach}: {reach?: Reach | undefined}) => {
  const data = [
    ['Hours', 'Avg Reach', 'Mean Reacg'],
    ...reach ?? []
    // ['12', 120],
    // ['24', 130],
    // ['48', 125],
  ];

  const options = {
    title: 'Average Reach',
    curveType: 'function',
    ...optionsBase,

    // colors: ['#F4B400'],
    chartArea: { width: '80%', height: '70%' },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Chart
        width={'100%'}
        height={'300px'}
        chartType="LineChart"
        // loader={<div>Loading Chart</div>}
        data={data}
        options={options} />
    </div>
  );
};


