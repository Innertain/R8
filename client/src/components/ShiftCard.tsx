import { Calendar, MapPin, Plus, Check, Utensils, Users, Book, Gift, Laptop, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type AirtableShift } from "@/lib/api";

interface ShiftCardProps {
  shift: AirtableShift;
}

const iconMap = {
  utensils: Utensils,
  users: Users,
  book: Book,
  gift: Gift,
  laptop: Laptop,
  heart: Heart,
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "urgent":
      return {
        label: "Urgent",
        className: "bg-amber-100 text-amber-800",
        progressColor: "bg-amber-500"
      };
    case "remote":
      return {
        label: "Remote",
        className: "bg-blue-100 text-blue-800",
        progressColor: "bg-blue-500"
      };
    case "full":
      return {
        label: "Full",
        className: "bg-gray-100 text-gray-800",
        progressColor: "bg-emerald-500"
      };
    default:
      return {
        label: "Active",
        className: "bg-emerald-100 text-emerald-800",
        progressColor: "bg-blue-500"
      };
  }
};

const getIconConfig = (icon: string, status: string) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Users;
  
  switch (icon) {
    case "utensils":
      return { Icon: IconComponent, bgColor: "bg-blue-100", iconColor: "text-blue-600" };
    case "users":
      return { Icon: IconComponent, bgColor: "bg-emerald-100", iconColor: "text-emerald-600" };
    case "book":
      return { Icon: IconComponent, bgColor: "bg-amber-100", iconColor: "text-amber-600" };
    case "gift":
      return { Icon: IconComponent, bgColor: "bg-purple-100", iconColor: "text-purple-600" };
    case "laptop":
      return { Icon: IconComponent, bgColor: "bg-blue-100", iconColor: "text-blue-600" };
    case "heart":
      return { Icon: IconComponent, bgColor: "bg-rose-100", iconColor: "text-rose-600" };
    default:
      return { Icon: IconComponent, bgColor: "bg-gray-100", iconColor: "text-gray-600" };
  }
};

export default function ShiftCard({ shift }: ShiftCardProps) {
  const statusConfig = getStatusConfig(shift.status);
  const { Icon, bgColor, iconColor } = getIconConfig(shift.icon, shift.status);
  const progressPercentage = (shift.volunteersSignedUp / shift.volunteersNeeded) * 100;
  const isFull = shift.status === "full";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create shift assignment mutation
  const signUpMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      // For now, we'll create a dummy volunteer ID - in real implementation this would come from authentication
      const demoVolunteerId = "demo-volunteer-123";
      const response = await apiRequest('POST', '/api/assignments', {
        volunteerId: demoVolunteerId,
        shiftId: shiftId,
        status: 'confirmed'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      toast({
        title: "Successfully Signed Up!",
        description: "You've been registered for this volunteer shift.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sign Up Failed",
        description: "There was an error signing up for this shift. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignUp = () => {
    console.log(`Signing up for shift: ${shift.id}`);
    signUpMutation.mutate(shift.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6">
      {/* Activity Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mr-3`}>
            <Icon className={`${iconColor} w-5 h-5`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{shift.activityName}</h3>
            <Badge className={`${statusConfig.className} text-xs mt-1`}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center mb-3 text-gray-600">
        <Calendar className="w-4 h-4 mr-3 text-gray-400" />
        <span className="text-sm">{shift.dateTime}</span>
      </div>

      {/* Location */}
      <div className="flex items-center mb-4 text-gray-600">
        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
        <span className="text-sm">{shift.location}</span>
      </div>

      {/* Volunteer Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Volunteers</span>
          <span className="text-sm text-gray-600">
            <span className={`font-semibold ${isFull ? 'text-emerald-600' : shift.status === 'urgent' ? 'text-amber-600' : 'text-blue-600'}`}>
              {shift.volunteersSignedUp}
            </span> / {shift.volunteersNeeded} signed up
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${statusConfig.progressColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <Button 
        className={`w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
          isFull 
            ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        onClick={handleSignUp}
        disabled={isFull || signUpMutation.isPending}
      >
        {isFull ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Full
          </>
        ) : signUpMutation.isPending ? (
          <>
            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing Up...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Sign Up
          </>
        )}
      </Button>
    </div>
  );
}
