// Utility functions for formatting dates with timezone information

// Format datetime in a FIXED timezone (for location-based events)
// Everyone sees the same time regardless of their location
export function formatTimeRangeInTimezone(
  startIso: string | null,
  endIso: string | null,
  timezone: string | null = null
): string {
  if (!startIso || !endIso) return 'TBD';
  
  // Default to Eastern Time for NC-based shifts
  const tz = timezone || 'America/New_York';
  
  try {
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    
    // Format date portion in the specified timezone
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: tz
    };
    const datePart = startDate.toLocaleDateString('en-US', dateOptions);
    
    // Format times in the specified timezone
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz
    };
    const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
    
    // Get timezone abbreviation
    const tzOptions: Intl.DateTimeFormatOptions = {
      timeZoneName: 'short',
      timeZone: tz
    };
    const timeWithTz = startDate.toLocaleTimeString('en-US', tzOptions);
    const tzMatch = timeWithTz.match(/([A-Z]{2,5})$/);
    const timezoneAbbr = tzMatch ? tzMatch[1] : '';
    
    return `${datePart} • ${startTime} - ${endTime} ${timezoneAbbr}`;
  } catch (error) {
    console.error('Error formatting time range:', error);
    return 'Invalid date';
  }
}

export function formatDateTimeWithTimezone(isoString: string | null): string {
  if (!isoString) return 'TBD';
  
  try {
    const date = new Date(isoString);
    
    // Format date portion
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    
    // Format time with timezone
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    const timePart = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${datePart} • ${timePart}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid date';
  }
}

// Legacy function - now redirects to fixed timezone version
// Kept for backwards compatibility but defaults to Eastern Time
export function formatTimeRangeWithTimezone(
  startIso: string | null,
  endIso: string | null,
  timezone: string | null = null
): string {
  return formatTimeRangeInTimezone(startIso, endIso, timezone);
}

export function formatTimeOnly(isoString: string | null): string {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return date.toLocaleTimeString('en-US', options);
  } catch (error) {
    return '';
  }
}
