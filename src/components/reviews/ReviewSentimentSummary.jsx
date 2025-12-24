import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ReviewSentimentSummary({ reviews }) {
  const [showSentiment, setShowSentiment] = useState(false);

  const { data: sentiment, isLoading, error } = useQuery({
    queryKey: ['review-sentiment', reviews?.length],
    queryFn: async () => {
      if (!reviews || reviews.length === 0) return null;

      const reviewTexts = reviews.map(r => r.review_text).join('\n\n---\n\n');
      
      const prompt = `Analyze the sentiment and key themes from these customer reviews. Provide a JSON response with the following structure:

{
  "overall_sentiment": "positive" | "neutral" | "negative",
  "sentiment_score": 0-100,
  "key_themes": [
    {"theme": "theme name", "sentiment": "positive|neutral|negative", "mentions": number}
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["improvement 1", "improvement 2"],
  "summary": "2-3 sentence summary of overall feedback"
}

Reviews:
${reviewTexts}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            overall_sentiment: { type: "string" },
            sentiment_score: { type: "number" },
            key_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  sentiment: { type: "string" },
                  mentions: { type: "number" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      return response;
    },
    enabled: showSentiment && reviews && reviews.length > 0,
  });

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-amber-600" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Review Analysis
          </CardTitle>
          {!showSentiment && (
            <Button
              onClick={() => setShowSentiment(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Reviews
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!showSentiment ? (
          <p className="text-sm text-slate-500">
            Get AI-powered insights about guest sentiment, key themes, and areas for improvement
          </p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="ml-2 text-slate-600">Analyzing reviews...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">Failed to analyze reviews</p>
        ) : sentiment ? (
          <div className="space-y-6">
            {/* Overall Sentiment */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getSentimentIcon(sentiment.overall_sentiment)}
                <div>
                  <p className="font-semibold text-slate-900 capitalize">
                    {sentiment.overall_sentiment} Sentiment
                  </p>
                  <p className="text-sm text-slate-600">
                    Sentiment Score: {sentiment.sentiment_score}/100
                  </p>
                </div>
              </div>
              <Badge className={getSentimentColor(sentiment.overall_sentiment)}>
                {sentiment.overall_sentiment}
              </Badge>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{sentiment.summary}</p>
            </div>

            {/* Key Themes */}
            {sentiment.key_themes && sentiment.key_themes.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Key Themes</h4>
                <div className="space-y-2">
                  {sentiment.key_themes.map((theme, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(theme.sentiment)}
                        <span className="text-sm font-medium text-slate-900">{theme.theme}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {theme.mentions} {theme.mentions === 1 ? 'mention' : 'mentions'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {sentiment.strengths && sentiment.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Strengths</h4>
                <div className="space-y-2">
                  {sentiment.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {sentiment.areas_for_improvement && sentiment.areas_for_improvement.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Areas for Improvement</h4>
                <div className="space-y-2">
                  {sentiment.areas_for_improvement.map((area, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <TrendingDown className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}