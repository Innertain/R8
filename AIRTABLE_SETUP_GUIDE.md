# Airtable Schema Setup Guide

## Quick Setup Checklist

### ✅ Step 1: Add Required Tables
Create these 3 new tables in your existing Airtable base:

**1. Volunteers Table**
```
Field Name          | Field Type        | Options/Settings
--------------------|-------------------|------------------
Name                | Single line text  | Required
Phone               | Phone number      | Required, Format: (000) 000-0000
Email               | Email             | Optional
Is Driver           | Checkbox          | Default: unchecked
Is Active           | Checkbox          | Default: checked
Airtable ID         | Formula           | Formula: RECORD_ID()
Created Date        | Created time      | Include time
```

**2. Volunteer Availability Table**
```
Field Name          | Field Type        | Options/Settings
--------------------|-------------------|------------------
Volunteer           | Link to record    | Link to: Volunteers table
Start Time          | Date              | Include time, 24hr format
End Time            | Date              | Include time, 24hr format
Is Recurring        | Checkbox          | Default: unchecked
Recurring Pattern   | Single select     | Options: Weekly, Bi-weekly, Monthly
Notes               | Long text         | Optional
Created Date        | Created time      | Include time
```

**3. Shift Assignments Table**
```
Field Name          | Field Type        | Options/Settings
--------------------|-------------------|------------------
Volunteer           | Link to record    | Link to: Volunteers table
Shift ID            | Single line text  | Required (will store V Shifts record ID)
Shift Name          | Lookup            | Look up activityName from V Shifts
Status              | Single select     | Options: confirmed, pending, cancelled
Assigned Date       | Created time      | Include time
Notes               | Long text         | Optional
```

### ✅ Step 2: Add Sample Data

**Add to Volunteers Table:**
```
Name: Demo User
Phone: 555-DEMO
Email: demo@example.com
Is Driver: ✓ (checked)
Is Active: ✓ (checked)
```

**Add to Volunteer Availability Table:**
Create 3-4 sample availability slots for Demo User:
```
1. Tomorrow 9:00 AM - 12:00 PM
2. Tomorrow 2:00 PM - 5:00 PM  
3. Next Monday 9:00 AM - 5:00 PM (Is Recurring: Weekly)
4. Next Wednesday 6:00 PM - 9:00 PM
```

### ✅ Step 3: Test the Integration

1. Open your volunteer app at `/volunteer-portal`
2. Enter phone number: `555-DEMO`
3. Test signing up for shifts
4. Check your Airtable "Shift Assignments" table - new records should appear
5. Test adding availability in the calendar

### ✅ Step 4: Production Setup

**For real volunteers:**
1. Add actual volunteer records to the Volunteers table
2. Give volunteers their phone numbers for login
3. They can set their availability using the calendar
4. Shift assignments will automatically sync to Airtable

## Table Relationships

```
V Shifts (existing)
    ↓ (Shift ID)
Shift Assignments ← Volunteer → Volunteers
                              ↓
                    Volunteer Availability
```

## Field Type Quick Reference

- **Single line text**: Short text (names, IDs)
- **Phone number**: Automatically formats phone numbers
- **Email**: Validates email format
- **Checkbox**: True/false values
- **Date**: Can include time, use 24-hour format
- **Link to record**: Creates relationships between tables
- **Lookup**: Shows data from linked records
- **Formula**: Auto-calculates values (use RECORD_ID() for unique IDs)
- **Created time**: Automatically tracks when record was created
- **Single select**: Dropdown with predefined options

## Common Issues & Solutions

**Issue**: Phone number not found during login
**Solution**: Make sure phone number in Volunteers table matches exactly (including format)

**Issue**: Shift signup not working
**Solution**: Verify Shift ID in assignments matches the record ID from V Shifts table

**Issue**: Availability not showing in calendar
**Solution**: Check Start Time and End Time are properly formatted with dates and times

**Issue**: Data not syncing
**Solution**: Verify AIRTABLE_TOKEN and VITE_BASE_ID are correctly set in Replit Secrets