"use client";
import { Chart } from 'react-google-charts';
import { optionsBase } from '../app/page';

export const AverageReachChart: React.FC = () => {
  const data = [
    ['Hours', 'Reach'],
    ['12', 120],
    ['24', 130],
    ['48', 125],
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
