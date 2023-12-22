"use client";
import { Chart } from 'react-google-charts';
import { optionsBase } from '@/components/optionsBase';

export const EngagementChart: React.FC = () => {
  const data = [
    ['Day', 'ERR', 'ERR24'],
    ['1', 20, 28],
    ['2', 30, 38],
    ['3', 40, 48],
    ['4', 50, 58],
    ['5', 60, 68],
  ];

  const options = {
    title: 'Engagement Rate',
    curveType: 'function',
    // legend: { position: 'bottom' },
    // hAxis: { title: 'Day' },
    // vAxis: { title: 'Rate' },
    ...optionsBase,
    // colors: ['#4285F4', '#DB4437'],
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
