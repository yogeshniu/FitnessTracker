import { useState } from "react";
import TodayProgress from "@/components/TodayProgress";
import WeeklyChart from "@/components/WeeklyChart";
import StatsOverview from "@/components/StatsOverview";
import ChallengeProgress from "@/components/ChallengeProgress";
import AddWorkoutDialog from "@/components/AddWorkoutDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMM d, yyyy");
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleWorkoutAdded = () => {
    toast({
      title: "Workout added",
      description: "Your workout has been successfully logged.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: [`/api/exercise-sets/${format(today, "yyyy-MM-dd")}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/progress/${format(today, "yyyy-MM-dd")}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-gray-600">Today is {formattedDate}</p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-accent hover:bg-amber-500 text-white"
          onClick={handleOpenModal}
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Today's Workout
        </Button>
      </div>

      {/* Today's Progress */}
      <TodayProgress date={today} />
      
      {/* Stats & Progress Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <WeeklyChart />
        <StatsOverview />
      </div>
      
      {/* Challenge Progress */}
      <ChallengeProgress />
      
      {/* Workout Modal */}
      <AddWorkoutDialog 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleWorkoutAdded}
      />
    </>
  );
};

export default Dashboard;
