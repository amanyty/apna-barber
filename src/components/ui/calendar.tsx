'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    className?: string;
}

function Calendar({
    selected,
    onSelect,
    disabled,
    className,
}: CalendarProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            onSelect?.(new Date(value));
        } else {
            onSelect?.(undefined);
        }
    };

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <input
            type="date"
            value={selected ? selected.toISOString().split('T')[0] : ''}
            onChange={handleChange}
            min={getMinDate()}
            className={cn(
                'flex h-11 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-base',
                'focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100',
                'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                className
            )}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
