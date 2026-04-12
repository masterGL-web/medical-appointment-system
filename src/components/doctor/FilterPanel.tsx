//src/components/doctor/FilterPanel.tsx
'use client';

import { AppointmentStatus } from '@/types/appointment.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Filters {
  status: AppointmentStatus | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  searchQuery: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalResults: number;
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  totalResults,
}: FilterPanelProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient ID or reason..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFilterChange({ status: value as AppointmentStatus | 'all' })
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={filters.dateRange} onValueChange={(value) =>
  onFilterChange({ dateRange: value as Filters['dateRange'] })
}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem> {/* ADDED */}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              className="flex-shrink-0"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Active filters:
            </span>
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => onFilterChange({ status: 'all' })}
                />
              </Badge>
            )}
            {filters.dateRange !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {filters.dateRange}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => onFilterChange({ dateRange: 'all' })}
                />
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Search: "{filters.searchQuery.slice(0, 20)}"
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => onFilterChange({ searchQuery: '' })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}