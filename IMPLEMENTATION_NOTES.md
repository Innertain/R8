# Implementation Notes: Airtable Integration Patterns

## Host Organization Display (Completed: Nov 2024)

### Problem
Display host organization names and logos from Airtable on volunteer shift cards throughout the platform.

### Airtable Schema Requirements
```
Table: V Shifts
- Host: Linked record field → Mutual Aid Partners table
- Name (from Host): Lookup field → Mutual Aid Partners.Name
- Logo (from Host): Lookup field → Mutual Aid Partners.Logo (attachment type)

Table: Mutual Aid Partners
- Name: Single line text
- Logo: Attachment field (images)
```

### Key Learnings

#### 1. Airtable API Field Behavior
**Critical**: Airtable API only returns fields that contain data. Empty/null fields are completely omitted from the response.

```javascript
// ❌ Wrong: Assumes field always exists
const hostName = fields['Name (from Host)'];

// ✅ Correct: Check existence first
const hostName = fields['Name (from Host)']?.[0] || null;
```

#### 2. Field Naming with Trailing Spaces
Some Airtable fields may have trailing spaces in their names. Always check both variations:

```javascript
const activityName = fields['Activity '] || fields['Activity'];
const location = fields['Location ']?.[0] || null;
```

#### 3. Lookup Field Extraction
**Linked Records**: Return as arrays of record IDs
```javascript
const hostId = fields['Host']?.[0] || null; // Get first linked record ID
```

**Lookup Fields**: Return as arrays of values
```javascript
const hostName = fields['Name (from Host)']?.[0] || null;
```

**Attachment Lookup Fields**: Return as arrays of objects with `.url` property
```javascript
const hostLogo = fields['Logo (from Host)']?.[0]?.url || null;
```

#### 4. Debugging Airtable Responses
When fields aren't appearing:

1. **Don't filter fields in API request** - fetch ALL fields to see what's available:
```javascript
// ❌ Don't do this when debugging
const url = `${baseUrl}?fields%5B%5D=Host&fields%5B%5D=Name`;

// ✅ Do this to see all available fields
const url = baseUrl; // No field filtering
```

2. **Log field names on first record**:
```javascript
if (index === 0) {
  console.log('Available fields:', Object.keys(fields));
  console.log('Sample data:', fields);
}
```

3. **Check if field exists vs. is empty**:
```javascript
console.log('Has Host field:', 'Host' in fields);
console.log('Host value:', fields['Host']);
```

### Implementation Checklist

When adding a new field display from Airtable:

- [ ] Verify field exists in Airtable UI and contains data
- [ ] Check for trailing spaces in field name
- [ ] Handle field absence (optional chaining: `?.`)
- [ ] For linked records: Access first element `[0]`
- [ ] For attachments: Access `.url` property
- [ ] Add null fallbacks
- [ ] Update frontend in ALL display locations
- [ ] Test with records that have AND don't have the field

### Frontend Display Pattern

**Consistent Host Organization Display:**
```jsx
{shift.host && (
  <div className="flex items-center gap-2 my-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg">
    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200">
      {shift.host.logo ? (
        <img 
          src={shift.host.logo} 
          alt={`${shift.host.name} logo`}
          className="w-6 h-6 object-contain"
        />
      ) : (
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {shift.host.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
    <div className="flex-1">
      <div className="text-xs text-gray-500 uppercase tracking-wide">Hosted by</div>
      <div className="font-semibold text-gray-800">{shift.host.name}</div>
    </div>
  </div>
)}
```

### Files Modified
- `server/airtable.ts`: Backend data fetching with host field extraction
- `client/src/components/ShiftCard.tsx`: Host display on public Browse Shifts page
- `client/src/pages/volunteer-portal.tsx`: Host display in two places:
  - `AuthenticatedShiftCard` component (Browse tab inside portal)
  - My Shifts tab assignment cards

### Performance Considerations
- Use Airtable lookup fields instead of separate API calls (more efficient)
- Cache Mutual Aid Partners table for 5 minutes to reduce API calls
- Only fetch host data when shift has Host field populated

---

## Shift Description Field (Completed: Nov 2024)

### Problem
Display shift descriptions from Airtable on all shift cards with mobile-friendly truncation and expandable "Read More" functionality.

### Implementation

#### Backend Changes
- Added `description` field extraction from Airtable V Shifts table
- Handles both "Description" and "Description " (with trailing space) field names
- Added to shift data structure returned to frontend

**File**: `server/airtable.ts`
```javascript
const description = fields['Description '] || fields['Description'] || '';
```

#### Frontend Changes
- Updated TypeScript type definition with optional `description` field
- Added expandable description component to THREE locations:
  1. Public Browse Shifts (`ShiftCard.tsx`)
  2. Volunteer Portal Browse tab (`AuthenticatedShiftCard` component)
  3. Volunteer Portal My Shifts tab (assignment cards)

**Type Definition** (`client/src/lib/api.ts`):
```typescript
export interface AirtableShift {
  description?: string;
  // ... other fields
}
```

**UI Pattern** (consistent across all locations):
- Truncates description to 100 characters on mobile
- Shows "Read More" / "Show Less" button for longer descriptions
- Expandable/collapsable with smooth toggle
- Preserves whitespace formatting with `whitespace-pre-wrap`
- Styled in gray box for visual distinction

**State Management**:
- Individual cards: `useState(false)` for single expand state
- List of assignments: `useState<{ [key: string]: boolean }>({})` for multiple expand states

### Files Modified
- `server/airtable.ts`: Extract description field
- `client/src/lib/api.ts`: Add description to TypeScript type
- `client/src/components/ShiftCard.tsx`: Add expandable description component
- `client/src/pages/volunteer-portal.tsx`: Add description to Browse tab and My Shifts tab
