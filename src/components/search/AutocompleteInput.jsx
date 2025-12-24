import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Search, MapPin, TrendingUp } from 'lucide-react';
import { generateAutocompleteSuggestions } from './EnhancedSearchEngine';

export default function AutocompleteInput({ 
  value, 
  onChange, 
  onSelect,
  allListings = [],
  placeholder = "Search...",
  icon: Icon = Search,
  type = 'keyword' // 'keyword' or 'location'
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    // Generate suggestions when value changes
    if (value && value.length >= 2) {
      const newSuggestions = generateAutocompleteSuggestions(value, allListings);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, allListings]);
  
  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };
  
  const handleSelect = (suggestion) => {
    if (onSelect) {
      onSelect(suggestion);
    } else {
      onChange(suggestion);
    }
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };
  
  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <Command className="rounded-lg">
            <CommandList>
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSelect(suggestion)}
                    className={`cursor-pointer ${
                      index === highlightedIndex ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {type === 'location' ? (
                        <MapPin className="w-4 h-4 text-gray-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}