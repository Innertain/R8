// Utility functions for formatting dates with timezone information

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

export function formatTimeRangeWithTimezone(
  startIso: string | null,
  endIso: string | null
): string {
  if (!startIso || !endIso) return 'TBD';
  
  try {
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    
    // Format date portion
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    const datePart = startDate.toLocaleDateString('en-US', dateOptions);
    
    // Format times
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit'
    };
    const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
    
    // Get timezone abbreviation
    const tzOptions: Intl.DateTimeFormatOptions = {
      timeZoneName: 'short'
    };
    const timeWithTz = startDate.toLocaleTimeString('en-US', tzOptions);
    const tzMatch = timeWithTz.match(/([A-Z]{2,5})$/);
    const timezone = tzMatch ? tzMatch[1] : '';
    
    return `${datePart} • ${startTime} - ${endTime} ${timezone}`;
  } catch (error) {
    console.error('Error formatting time range:', error);
    return 'Invalid date';
  }
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
