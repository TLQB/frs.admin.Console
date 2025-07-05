"use client";

import React, { useState, useEffect } from "react";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { format } from "date-fns";

interface FilterProps {
  startDate: Date;
  endDate: Date;
  status: string;
  device: string;
  deviceOptions: Array<{ value: string; label: string }>;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onStatusChange: (status: string) => void;
  onDeviceChange: (device: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const Filter: React.FC<FilterProps> = ({
  startDate,
  endDate,
  status,
  device,
  deviceOptions = [
    { value: 'all', label: 'All Devices' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' }
  ],
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onDeviceChange,
  onExport,
  onRefresh,
  isLoading = false,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'unknown', label: 'Unknown' }
  ];

  // Local state for validation errors
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };
  
  // Validate dates when either start or end date changes
  useEffect(() => {
    if (startDate > endDate) {
      setDateError("Start date cannot be after end date");
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);
  
  // Handle start date change with validation
  const handleStartDateChange = (date: Date) => {
    // If new start date is after end date, set it to end date
    if (date > endDate) {
      onStartDateChange(endDate);
    } else {
      onStartDateChange(date);
    }
  };
  
  // Handle end date change with validation
  const handleEndDateChange = (date: Date) => {
    // If new end date is before start date, set start date to new end date
    if (date < startDate) {
      onStartDateChange(date);
    }
    onEndDateChange(date);
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="flex flex-wrap items-end gap-4 w-full">
          <div className="w-full sm:w-auto">
            <DatePicker
              id="start-date"
              label="Start Date"
              defaultDate={startDate}
              onChange={(selectedDates) => {
                if (selectedDates.length > 0) {
                  handleStartDateChange(selectedDates[0]);
                }
              }}
            />
            {dateError && (
              <p className="text-xs text-red-500 mt-1">{dateError}</p>
            )}
          </div>
          <div className="w-full sm:w-auto">
            <DatePicker
              id="end-date"
              label="End Date"
              defaultDate={endDate}
              onChange={(selectedDates) => {
                if (selectedDates.length > 0) {
                  handleEndDateChange(selectedDates[0]);
                }
              }}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Label>Status</Label>
            <Select
              options={statusOptions}
              defaultValue={status}
              onChange={onStatusChange}
              className="min-w-[150px]"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Label>Device</Label>
            <Select
              options={deviceOptions}
              defaultValue={device}
              onChange={onDeviceChange}
              className="min-w-[150px]"
            />
          </div>
          <div className="w-full sm:w-auto flex items-end gap-2 sm:ml-auto">
            <Button 
              variant="outline"
              onClick={() => onRefresh?.()}
              className="w-full sm:w-auto"
              disabled={isLoading || !!dateError}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button 
              variant="primary"
              onClick={() => onExport?.()}
              className="w-full sm:w-auto"
              disabled={isLoading || !!dateError}
            >
              Export
            </Button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Showing data from {formatDate(startDate)} to {formatDate(endDate)}
        </div>
      </div>
    </div>
  );
};

export default Filter;
