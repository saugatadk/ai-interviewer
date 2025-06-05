import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinalRecommendations as FinalRecommendationsType } from "@/types/feedback";
import { Star, Target, TrendingUp } from "lucide-react";

interface FinalRecommendationsProps {
  recommendations?: FinalRecommendationsType | null;
}

const FinalRecommendations: React.FC<FinalRecommendationsProps> = ({ recommendations }) => {
  // Fallback empty array or strings if recommendations or props are missing
  const practiceFocusAreas = recommendations?.practice_focus_areas ?? [];
  const overallImpression = recommendations?.overall_impression ?? "No overall impression provided.";
  const finalTip = recommendations?.final_tip ?? "No pro tip provided.";

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center text-emerald-700'>
            <Target className='w-5 h-5 mr-2' />
            Practice Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {practiceFocusAreas.length > 0 ? (
              practiceFocusAreas.map((area, index) => (
                <li key={index} className='flex items-start'>
                  <div className='w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 mt-0.5 flex-shrink-0'>
                    {index + 1}
                  </div>
                  <span className='text-sm sm:text-base text-gray-700'>{area}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No practice focus areas provided.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Overall Impression & Final Tip */}
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center text-blue-700'>
              <Star className='w-5 h-5 mr-2' />
              Overall Impression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-700 leading-relaxed'>{overallImpression}</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 '>
          <CardHeader>
            <CardTitle className='flex items-center text-emerald-700'>
              <TrendingUp className='w-5 h-5 mr-2' />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-emerald-800 font-medium'>{finalTip}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalRecommendations;
