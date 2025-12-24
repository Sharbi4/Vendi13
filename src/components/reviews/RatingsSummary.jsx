import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react';

export default function RatingsSummary({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const calculateAverage = (field) => {
    const validRatings = reviews.filter(r => r[field]).map(r => r[field]);
    if (validRatings.length === 0) return 0;
    return (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1);
  };

  const averageRating = calculateAverage('rating');
  const cleanliness = calculateAverage('cleanliness_rating');
  const communication = calculateAverage('communication_rating');
  const accuracy = calculateAverage('accuracy_rating');
  const value = calculateAverage('value_rating');

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <span className="text-5xl font-bold text-slate-900">{averageRating}</span>
            </div>
            <p className="text-slate-600 mb-1">Overall Rating</p>
            <p className="text-sm text-slate-500">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-8">{stars} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ 
                      width: `${maxCount > 0 ? (distribution[stars] / maxCount) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-8 text-right">
                  {distribution[stars]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        {(cleanliness > 0 || communication > 0 || accuracy > 0 || value > 0) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-slate-900 mb-4">Rating Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cleanliness > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{cleanliness}</span>
                  </div>
                  <p className="text-xs text-slate-600">Cleanliness</p>
                </div>
              )}
              {communication > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{communication}</span>
                  </div>
                  <p className="text-xs text-slate-600">Communication</p>
                </div>
              )}
              {accuracy > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{accuracy}</span>
                  </div>
                  <p className="text-xs text-slate-600">Accuracy</p>
                </div>
              )}
              {value > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                  <p className="text-xs text-slate-600">Value</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}