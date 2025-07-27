import { useState } from "react";
import { Search, Bell, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShiftCard from "@/components/ShiftCard";

interface Shift {
  id: number;
  activityName: string;
  dateTime: string;
  location: string;
  volunteersNeeded: number;
  volunteersSignedUp: number;
  status: "active" | "urgent" | "remote" | "full";
  category: string;
  icon: string;
}

const shifts: Shift[] = [
  {
    id: 1,
    activityName: "Deliver Food",
    dateTime: "Monday, Dec 18 • 10:00 AM - 2:00 PM",
    location: "Downtown Community Center",
    volunteersNeeded: 12,
    volunteersSignedUp: 8,
    status: "active",
    category: "food-service",
    icon: "utensils"
  },
  {
    id: 2,
    activityName: "Community Cleanup",
    dateTime: "Saturday, Dec 23 • 9:00 AM - 1:00 PM",
    location: "Riverside Park",
    volunteersNeeded: 20,
    volunteersSignedUp: 15,
    status: "active",
    category: "environment",
    icon: "users"
  },
  {
    id: 3,
    activityName: "Reading Tutor",
    dateTime: "Tuesday, Dec 19 • 3:00 PM - 5:00 PM",
    location: "Lincoln Elementary School",
    volunteersNeeded: 8,
    volunteersSignedUp: 3,
    status: "urgent",
    category: "education",
    icon: "book"
  },
  {
    id: 4,
    activityName: "Gift Wrapping",
    dateTime: "Friday, Dec 22 • 6:00 PM - 9:00 PM",
    location: "Community Mall",
    volunteersNeeded: 6,
    volunteersSignedUp: 6,
    status: "full",
    category: "community",
    icon: "gift"
  },
  {
    id: 5,
    activityName: "Tech Support",
    dateTime: "Thursday, Dec 21 • 7:00 PM - 9:00 PM",
    location: "Remote (Online)",
    volunteersNeeded: 5,
    volunteersSignedUp: 2,
    status: "remote",
    category: "technology",
    icon: "laptop"
  },
  {
    id: 6,
    activityName: "Senior Care",
    dateTime: "Sunday, Dec 24 • 1:00 PM - 4:00 PM",
    location: "Sunset Senior Center",
    volunteersNeeded: 15,
    volunteersSignedUp: 9,
    status: "active",
    category: "healthcare",
    icon: "heart"
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || locationFilter === "all" || 
                           (locationFilter === "remote" && shift.location.includes("Remote")) ||
                           (locationFilter === "downtown" && shift.location.toLowerCase().includes("downtown")) ||
                           (locationFilter === "suburbs" && !shift.location.toLowerCase().includes("downtown") && !shift.location.includes("Remote"));
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="text-blue-500 text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">VolunteerShift</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Shifts</h2>
          <p className="text-gray-600">Find and sign up for volunteer opportunities in your area</p>
        </div>

        {/* Filter/Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              type="text" 
              placeholder="Search shifts..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="suburbs">Suburbs</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shift Cards Grid */}
        {filteredShifts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 text-4xl mb-4 w-16 h-16" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts available</h3>
            <p className="text-gray-500 mb-6">Check back later for new volunteer opportunities.</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                setSearchQuery("");
                setLocationFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
