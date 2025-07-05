"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  subtitle, 
  value, 
  trend, 
  icon,
  isLoading = false
}) => {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl shadow-sm p-6">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
            </div>
            {icon && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                {icon}
              </div>
            )}
          </div>
          {trend && (
            <div className="mt-4 flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {trend.isPositive ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">vs. previous period</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface MetricsProps {
  data: {
    totalVerifications: number;
    successRate: number;
    averageConfidence: number;
    uniqueDevices: number;
  };
  isLoading?: boolean;
}

const Metrics: React.FC<MetricsProps> = ({ data, isLoading = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <MetricCard
        title="Total Verifications"
        subtitle="All-time verifications"
        value={data.totalVerifications.toLocaleString()}
        isLoading={isLoading}
      />
      <MetricCard
        title="Success Rate"
        subtitle="Successful verifications"
        value={`${data.successRate.toFixed(1)}%`}
        trend={{ value: 2.5, isPositive: true }}
        isLoading={isLoading}
      />
      <MetricCard
        title="Average Confidence"
        subtitle="Verification confidence"
        value={`${data.averageConfidence.toFixed(1)}%`}
        trend={{ value: 1.2, isPositive: true }}
        isLoading={isLoading}
      />
      <MetricCard
        title="Unique Devices"
        subtitle="Active devices"
        value={data.uniqueDevices}
        trend={{ value: 0.8, isPositive: false }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Metrics;