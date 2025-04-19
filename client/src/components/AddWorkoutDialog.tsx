import { useState } from "react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  defaultExercise?: string;
}

const AddWorkoutDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  defaultExercise
}: AddWorkoutDialogProps) => {
  const [exerciseType, setExerciseType] = useState(defaultExercise || "Push-ups");
  const [reps, setReps] = useState("");
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  const handleExerciseTypeChange = (value: string) => {
    setExerciseType(value);
  };
  
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setReps(value);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!exerciseType) {
      toast({
        title: "Error",
        description: "Please select an exercise type",
        variant: "destructive"
      });
      return;
    }
    
    if (!reps || parseInt(reps) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of repetitions",
        variant: "destructive"
      });
      return;
    }
    
    if (!time) {
      toast({
        title: "Error",
        description: "Please enter the time when you completed the exercise",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit the workout
      await apiRequest("POST", "/api/exercise-sets", {
        exerciseType,
        reps: parseInt(reps),
        date: new Date(),
        timeCompleted: time,
        userId: 1
      });
      
      // Reset form
      setReps("");
      setTime(format(new Date(), "HH:mm"));
      
      // Notify parent
      onSubmit();
    } catch (error) {
      console.error("Error adding workout:", error);
      toast({
        title: "Error",
        description: "Failed to add workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Exercise Set</DialogTitle>
          <DialogDescription>
            Record your completed exercise set for today's challenge.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise-type">Exercise Type</Label>
              <Select 
                value={exerciseType} 
                onValueChange={handleExerciseTypeChange}
              >
                <SelectTrigger id="exercise-type">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Push-ups">Push-ups</SelectItem>
                  <SelectItem value="Squats">Squats</SelectItem>
                  <SelectItem value="Sit-ups">Sit-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rep-count">Repetition Count</Label>
              <Input 
                id="rep-count"
                type="number"
                min="1"
                max="100"
                value={reps}
                onChange={handleRepsChange}
                placeholder="Number of reps"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time-completed">Time Completed</Label>
              <Input 
                id="time-completed"
                type="time"
                value={time}
                onChange={handleTimeChange}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkoutDialog;
