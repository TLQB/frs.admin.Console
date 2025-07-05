"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ChartProps {
  verificationStats: {
    success: number;
    failed: number;
  };
  dailyStats: Array<{
    date: string;
    total: number;
    success: number;
    failed: number;
  }>;
  isLoading?: boolean;
}

const Charts: React.FC<ChartProps> = ({ verificationStats, dailyStats, isLoading = false }) => {
  // Pie chart data
  const pieData = {
    labels: ['Success', 'Failed'],
    datasets: [
      {
        data: [verificationStats.success, verificationStats.failed],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(37, 99, 235, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data
  const barData = {
    labels: dailyStats.map(stat => {
      // Format date for display (e.g., "Jan 01")
      const date = new Date(stat.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    }),
    datasets: [
      {
        label: 'Success',
        data: dailyStats.map(stat => stat.success),
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Failed',
        data: dailyStats.map(stat => stat.failed),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: TooltipItem<"bar">[]) {
            return tooltipItems[0].label;
          },
          label: function(context: TooltipItem<"bar">) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<"pie">) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const LoadingPlaceholder = () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
      <div className="text-center">
        <div className="animate-pulse flex justify-center mb-2">
          <div className="h-4 w-4 bg-gray-400 dark:bg-gray-600 rounded-full mr-1"></div>
          <div className="h-4 w-4 bg-gray-400 dark:bg-gray-600 rounded-full mr-1 animate-pulse-delay-200"></div>
          <div className="h-4 w-4 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-delay-400"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Verification Results</h3>
        <div className="h-64">
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <Pie data={pieData} options={pieOptions} />
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Daily Verification Statistics</h3>
        <div className="h-64">
          {isLoading || dailyStats.length === 0 ? (
            <LoadingPlaceholder />
          ) : (
            <Bar data={barData} options={barOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
