import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import ExerciseTracker from "./ExerciseTracker";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface TodayProgressProps {
  date: Date;
}

const TodayProgress = ({ date }: TodayProgressProps) => {
  const formattedDate = format(date, "yyyy-MM-dd");
  
  const { data: dailyProgress, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/progress/${formattedDate}`],
  });
  
  const { data: exerciseSets, isLoading: isSetsLoading } = useQuery({
    queryKey: [`/api/exercise-sets/${formattedDate}`],
  });
  
  const isLoading = isProgressLoading || isSetsLoading;
  
  // Group exercise sets by exercise type
  const groupedSets = exerciseSets ? exerciseSets.reduce((acc: any, set: any) => {
    if (!acc[set.exerciseName]) {
      acc[set.exerciseName] = [];
    }
    acc[set.exerciseName].push(set);
    return acc;
  }, {}) : {};
  
  // Setup exercise data
  const exercises = [
    {
      name: "Push-ups",
      count: dailyProgress?.pushupsDone || 0,
      goal: 100,
      sets: groupedSets["Push-ups"] || []
    },
    {
      name: "Squats",
      count: dailyProgress?.squatsDone || 0,
      goal: 100,
      sets: groupedSets["Squats"] || []
    },
    {
      name: "Sit-ups",
      count: dailyProgress?.situpsDone || 0,
      goal: 100,
      sets: groupedSets["Sit-ups"] || []
    }
  ];

  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
      
      {isLoading ? (
        <div className="py-8 flex items-center justify-center">
          <p>Loading today's progress...</p>
        </div>
      ) : (
        <>
          {exercises.map((exercise) => (
            <ExerciseTracker 
              key={exercise.name}
              name={exercise.name}
              count={exercise.count}
              goal={exercise.goal}
              sets={exercise.sets}
            />
          ))}
        </>
      )}
    </Card>
  );
};

export default TodayProgress;
