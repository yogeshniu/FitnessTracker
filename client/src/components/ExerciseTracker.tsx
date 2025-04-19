import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AddWorkoutDialog from "./AddWorkoutDialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ExerciseTrackerProps {
  name: string;
  count: number;
  goal: number;
  sets: any[];
}

const ExerciseTracker = ({ name, count, goal, sets }: ExerciseTrackerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const percentage = Math.min(100, Math.round((count / goal) * 100));
  const isCompleted = count >= goal;
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleWorkoutAdded = () => {
    toast({
      title: `${name} set added`,
      description: "Your workout has been successfully logged.",
    });
    
    // Invalidate queries to refresh data
    const today = new Date();
    queryClient.invalidateQueries({ queryKey: [`/api/exercise-sets/${format(today, "yyyy-MM-dd")}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/progress/${format(today, "yyyy-MM-dd")}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    
    setIsModalOpen(false);
  };
  
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
        <div className="flex items-center">
          <CheckCircle className={`h-5 w-5 ${isCompleted ? 'text-secondary' : 'text-primary'} mr-2`} />
          <h4 className="font-medium">{name}</h4>
        </div>
        <div className="mt-2 md:mt-0 flex items-center">
          <span className="font-bold text-lg">{count}</span>
          <span className="text-gray-500 mx-1">/</span>
          <span className="text-gray-500">{goal}</span>
          {isCompleted ? (
            <span className="ml-2 py-1 px-2 bg-green-100 text-secondary text-xs rounded-full font-medium">
              Completed!
            </span>
          ) : (
            <span className="ml-2 py-1 px-2 bg-blue-100 text-primary text-xs rounded-full font-medium">
              {percentage}%
            </span>
          )}
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-3 ${isCompleted ? 'bg-secondary' : 'bg-primary'}`}
      />
      
      <div className="mt-3 flex flex-wrap gap-2">
        {sets.map((set) => (
          <span 
            key={set.id}
            className={isCompleted 
              ? "bg-green-50 text-secondary px-3 py-1 rounded-full text-sm" 
              : "bg-blue-50 text-primary px-3 py-1 rounded-full text-sm"
            }
          >
            {set.reps} reps ({set.timeCompleted})
          </span>
        ))}
        
        <button 
          className="bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center hover:bg-gray-50"
          onClick={handleOpenModal}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Set
        </button>
      </div>
      
      <AddWorkoutDialog 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleWorkoutAdded}
        defaultExercise={name}
      />
    </div>
  );
};

export default ExerciseTracker;
