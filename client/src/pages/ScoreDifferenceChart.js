// ScoreDifferenceChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScoreDifferenceChart = ({ latestScore, previousScore }) => {
  const data = {
    labels: ['Latest Quiz', 'Previous Quiz'],
    datasets: [
      {
        label: 'Scores',
        data: [latestScore, previousScore],
        backgroundColor: ['#2ecc71', '#e74c3c'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Score Comparison',
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ScoreDifferenceChart;
