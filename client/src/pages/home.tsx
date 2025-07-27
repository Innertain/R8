import { useState } from "react";
import { Search, Bell, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import ShiftCard from "@/components/ShiftCard";
import { fetchShiftsFromAirtable, type AirtableShift } from "@/lib/api";

// Use AirtableShift type from API module

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Fetch shifts from Airtable using React Query
  const { data: shifts = [], isLoading, error } = useQuery({
    queryKey: ['/api/shifts'],
    queryFn: fetchShiftsFromAirtable,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading volunteer shifts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 text-4xl mb-4 w-16 h-16" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load shifts</h3>
            <p className="text-gray-500 mb-6">Please check your connection and try again.</p>
          </div>
        ) : filteredShifts.length > 0 ? (
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
