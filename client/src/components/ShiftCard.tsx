import { useState } from "react";
import { Calendar, MapPin, Plus, Check, Utensils, Users, Book, Gift, Laptop, Heart, Clock, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type AirtableShift } from "@/lib/api";
import { formatTimeRangeInTimezone } from "@/lib/dateUtils";

interface ShiftCardProps {
  shift: AirtableShift;
  showSignup?: boolean;
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
        label: "Urgent - Need Volunteers",
        className: "bg-amber-100 text-amber-900 border border-amber-300",
        progressColor: "bg-amber-500"
      };
    case "remote":
      return {
        label: "Remote",
        className: "bg-blue-100 text-blue-900 border border-blue-300",
        progressColor: "bg-blue-500"
      };
    case "full":
      return {
        label: "Full",
        className: "bg-gray-100 text-gray-900 border border-gray-300",
        progressColor: "bg-emerald-500"
      };
    default:
      return {
        label: "Open for Volunteers",
        className: "bg-emerald-100 text-emerald-900 border border-emerald-300",
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

export default function ShiftCard({ shift, showSignup = true }: ShiftCardProps) {
  const statusConfig = getStatusConfig(shift.status);
  const { Icon, bgColor, iconColor } = getIconConfig(shift.icon, shift.status);
  const progressPercentage = (shift.volunteersSignedUp / shift.volunteersNeeded) * 100;
  const isFull = shift.status === "full";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Truncate description to ~100 characters for mobile
  const maxDescriptionLength = 100;
  const shouldTruncate = shift.description && shift.description.length > maxDescriptionLength;
  const displayDescription = shouldTruncate && !isDescriptionExpanded 
    ? shift.description?.substring(0, maxDescriptionLength) + '...' 
    : shift.description;

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
    onError: (error: any) => {
      console.error('Sign up error:', error);
      
      // Check if it's a duplicate assignment error
      if (error.status === 409 || (error.message && error.message.includes('already signed up'))) {
        toast({
          title: "Already Signed Up",
          description: "You're already registered for this shift. Check 'My Shifts' to manage your assignments.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: "There was an error signing up for this shift. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSignUp = () => {
    console.log(`Signing up for shift: ${shift.id}`);
    signUpMutation.mutate(shift.id);
  };

  return (
    <div className="rounded-xl p-6 card-hover-effect">
      {/* Activity Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mr-3`}>
            <Icon className={`${iconColor} w-5 h-5 activity-icon transition-all duration-300`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{shift.activityName}</h3>
            <Badge className={`${statusConfig.className} text-xs mt-1 status-badge transition-all duration-300`}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center mb-3 text-gray-600 shift-card-content">
        <Calendar className="w-4 h-4 mr-3 text-gray-400" />
        <span className="text-sm">{formatTimeRangeInTimezone(shift.startTime, shift.endTime, shift.timezone)}</span>
      </div>

      {/* Location */}
      <div className="mb-3 text-gray-600 shift-card-content">
        <div className="flex items-start">
          <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">{shift.location}</div>
            {(shift.siteAddress || shift.siteCity || shift.siteState) && (
              <div className="text-xs text-gray-500 mt-1">
                {shift.siteAddress && <div>{shift.siteAddress}</div>}
                {(shift.siteCity || shift.siteState) && (
                  <div>{shift.siteCity}{shift.siteCity && shift.siteState && ', '}{shift.siteState}</div>
                )}
                {(shift.siteAddress || shift.siteCity) && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${shift.siteAddress || ''} ${shift.siteCity || ''} ${shift.siteState || ''}`.trim()
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Get Directions
                  </a>
                )}
              </div>
            )}
            {shift.sitePhone && (
              <div className="text-xs text-gray-500 mt-1">
                <Phone className="w-3 h-3 inline mr-1" />
                {shift.sitePhone}
              </div>
            )}
            {shift.siteStatus && (
              <div className="text-xs text-gray-500 mt-1">
                Status: {shift.siteStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Host Information */}
      {shift.host && (
        <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg shift-card-content">
          <div className="w-8 h-8 mr-3 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200">
            {shift.host.logo ? (
              <img 
                src={shift.host.logo} 
                alt={`${shift.host.name} logo`}
                className="w-6 h-6 object-contain activity-icon transition-all duration-300"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center activity-icon transition-all duration-300">
                <span className="text-white text-sm font-bold">
                  {shift.host.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Hosted by</div>
            <div className="font-semibold text-gray-800">{shift.host.name}</div>
          </div>
        </div>
      )}

      {/* Description */}
      {shift.description && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg shift-card-content">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayDescription}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              data-testid={`button-expand-description-${shift.id}`}
            >
              {isDescriptionExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Read More
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Volunteer Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Volunteers</span>
          <span className="text-sm text-gray-600">
            <span className={`font-semibold ${isFull ? 'text-emerald-700' : shift.status === 'urgent' ? 'text-amber-700' : 'text-blue-900'}`}>
              {shift.volunteersSignedUp}
            </span> / {shift.volunteersNeeded} signed up
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${statusConfig.progressColor} h-2 rounded-full transition-all duration-300 progress-bar`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      {showSignup ? (
        <Button 
          className={`w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
            isFull 
              ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' 
              : 'bg-blue-500 hover:bg-blue-600 text-white btn-hover-effect'
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
      ) : (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600 mb-2">
            {isFull ? "This shift is full" : "Login to volunteer portal to sign up"}
          </p>
          <Button 
            variant="outline" 
            className="w-full btn-hover-effect"
            onClick={() => window.location.href = '/volunteer'}
          >
            Go to Volunteer Portal
          </Button>
        </div>
      )}
    </div>
  );
}
