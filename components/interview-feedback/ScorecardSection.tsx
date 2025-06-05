import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scorecard } from "@/types/feedback";

interface ScorecardSectionProps {
  scorecard?: Scorecard | null;
  getScoreValue: (score: number) => number;
  scoreColor: (score: number) => string;
}

const formatSkillName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ScorecardSection: React.FC<ScorecardSectionProps> = ({ scorecard, getScoreValue, scoreColor }) => {
  if (!scorecard || Object.keys(scorecard).length === 0) {
    return (
      <Card className='mb-6 overflow-hidden shadow-md border-emerald-100'>
        <CardHeader className='bg-gray-50 border-b p-6'>
          <CardTitle className='text-xl'>Skills Scorecard</CardTitle>
        </CardHeader>
        <CardContent className='p-6 text-gray-500 italic'>No skill scores available.</CardContent>
      </Card>
    );
  }

  return (
    <Card className='mb-6 overflow-hidden shadow-md border-emerald-100'>
      <CardHeader className='bg-gray-50 border-b p-6'>
        <CardTitle className='text-xl'>Skills Scorecard</CardTitle>
      </CardHeader>

      <CardContent className='p-6'>
  <div className='space-y-5'>
    {Object.entries(scorecard)
      .filter(
        ([, data]) =>
          typeof data === "object" &&
          data !== null &&
          typeof data.score === "number" &&
          data.score >= 0 &&
          data.score <= 10
      )
      .map(([skill, data]) => {
        const score = data.score;
        const commentary =
          typeof data.commentary === "string" && data.commentary.trim().length > 0
            ? data.commentary
            : "No commentary provided.";

        return (
          <div key={skill} className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='font-medium'>{formatSkillName(skill)}</span>
              <div className='flex items-center gap-2'>
                <span className='bg-gray-100 text-gray-800 text-sm py-0.5 px-2 rounded-lg font-medium'>
                  {score}/10
                </span>
              </div>
            </div>

            <Progress value={getScoreValue(score)} className={`h-2 ${scoreColor(score)}`} />

            <p className='text-sm text-gray-600'>{commentary}</p>
          </div>
        );
      })}
  </div>
</CardContent>
    </Card>
  );
};

export default ScorecardSection;