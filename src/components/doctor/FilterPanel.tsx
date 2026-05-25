//src/components/doctor/FilterPanel.tsx
'use client';

import { AppointmentStatus } from '@/types/appointment.types';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient name or reason..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="pl-10 h-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange({ status: value as AppointmentStatus | 'all' })}
        >
          <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl border-slate-200">
            <SelectValue placeholder="All Status" />
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
        <Select
          value={filters.dateRange}
          onValueChange={(value) => onFilterChange({ dateRange: value as Filters['dateRange'] })}
        >
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-slate-200">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Active:
          </span>
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.status}
              <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => onFilterChange({ status: 'all' })} />
            </Badge>
          )}
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.dateRange}
              <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => onFilterChange({ dateRange: 'all' })} />
            </Badge>
          )}
          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1 text-xs">
              "{filters.searchQuery.slice(0, 20)}"
              <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => onFilterChange({ searchQuery: '' })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}