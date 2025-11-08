"use client"
import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';

const views = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const prints = [2400, 1398, 9800, 3908, 4800, 3800, 4300];

const monthsLabel = [
  ' Janvier',
  ' Février',
  ' Mars',
  ' Avril',
  ' Mai',
  ' Juin',
  ' Juillet',
];

export default function StatsFactureMe() {
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <BarChart
        series={[
          {
            data: prints,
            label: 'prints',
            id: 'printId',

            yAxisId: 'leftAxisId',
          },
          {
            data: views,
            label: 'views',
            id: 'viewId',
            yAxisId: 'rightAxisId',
          },
        ]}
        xAxis={[{ data: monthsLabel }]}
        yAxis={[
          { id: 'leftAxisId', width: 50 },
          { id: 'rightAxisId', position: 'right' },
        ]}
      />
    </Box>
  );
}