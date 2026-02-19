import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';  // Ensure this is the correct import path
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateRangeChange }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (date: Date | undefined) => {
    const newDate = date ?? null;
    setStartDate(newDate);
    onDateRangeChange(newDate, endDate);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    const newDate = date ?? null;
    setEndDate(newDate);
    onDateRangeChange(startDate, newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="w-[300px] justify-start text-left font-normal"
        >
          <span>
            {startDate && endDate
              ? `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`
              : "Select Date Range"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col gap-2 p-2">
          <Calendar
            mode="single"
            selected={startDate as Date}
            onSelect={handleStartDateChange}
            initialFocus
          />
          <Calendar
            mode="single"
            selected={endDate as Date}
            onSelect={handleEndDateChange}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
