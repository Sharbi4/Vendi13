import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import { generateSearchRecommendations } from './AISearchParser';

export default function SearchRecommendations({ user, onSelectSuggestion }) {
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's view history
  const { data: viewHistory = [] } = useQuery({
    queryKey: ['user-view-history', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const views = await base44.entities.ListingView.filter(
        { viewer_email: user.email },
        '-created_date',
        20
      );
      return views;
    },
    enabled: !!user?.email,
  });

  // Fetch user's saved searches
  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-searches', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.SavedSearch.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  // Generate AI recommendations
  useEffect(() => {
    if (user && (viewHistory.length > 0 || savedSearches.length > 0)) {
      loadAISuggestions();
    }
  }, [user, viewHistory.length, savedSearches.length]);

  const loadAISuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await generateSearchRecommendations(
        user.email,
        viewHistory,
        savedSearches
      );
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Popular searches fallback
  const popularSearches = [
    "Food trucks with AC available this weekend",
    "Ghost kitchens under $200/day in major cities",
    "Verified trailers for long-term rental",
    "Equipment with delivery service"
  ];

  const displaySuggestions = aiSuggestions.length > 0 ? aiSuggestions : popularSearches;
  const isAIPowered = aiSuggestions.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {isAIPowered ? (
          <>
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-slate-700">Recommended for you</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Popular searches</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displaySuggestions.map((suggestion, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="justify-start text-left h-auto py-3 px-4 hover:border-[#FF5124] hover:text-[#FF5124] transition-colors"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            <div className="flex items-start gap-2 w-full">
              {isAIPowered ? (
                <Sparkles className="w-3.5 h-3.5 mt-0.5 text-purple-500 flex-shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
              )}
              <span className="text-sm flex-1">{suggestion}</span>
            </div>
          </Button>
        ))}
      </div>

      {isLoading && (
        <p className="text-xs text-slate-500 text-center">
          Generating personalized suggestions...
        </p>
      )}
    </div>
  );
}