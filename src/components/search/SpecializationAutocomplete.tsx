//src/components/search/SpecializationAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { doctorService } from '@/services/doctor.service';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useDebounceValue } from 'usehooks-ts';
import { cn } from '@/lib/utils';

interface SpecializationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SpecializationAutocomplete({
  value,
  onChange,
  placeholder = 'Search specialization...',
  className,
}: SpecializationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce search query (300ms)
  const [debouncedQuery] = useDebounceValue(inputValue, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      searchSpecializations(debouncedQuery);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSpecializations = async (query: string) => {
    try {
      setLoading(true);
      const results = await doctorService.searchSpecializations(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch (error) {
      console.error('Failed to search specializations:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelectSuggestion = (specialization: string) => {
    setInputValue(specialization);
    onChange(specialization);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">Searching...</div>
          ) : (
            <ul className="py-1">
              {suggestions.map((specialization, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelectSuggestion(specialization)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {specialization}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* No results */}
      {isOpen && !loading && suggestions.length === 0 && debouncedQuery.trim().length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">No specializations found</p>
        </div>
      )}
    </div>
  );
}