// Debug script to check Airtable V Shifts table directly
async function debugAirtableShifts() {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period

  try {
    console.log('=== Debugging V Shifts Table ===');
    
    // Try without any filters first
    const url = `https://api.airtable.com/v0/${BASE_ID}/V%20Shifts`;
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    console.log(`\n✅ TOTAL RECORDS FOUND: ${data.records?.length || 0}\n`);
    
    data.records?.forEach((record, index) => {
      console.log(`--- Record ${index + 1} ---`);
      console.log(`ID: ${record.id}`);
      console.log(`Activity: ${record.fields['Name (from Activity )']?.[0] || record.fields.Name || 'No Name'}`);
      console.log(`Created: ${record.fields['Created Time'] || 'Unknown'}`);
      console.log(`Raw Fields:`, Object.keys(record.fields));
      console.log('');
    });
    
    // Check for pagination
    if (data.offset) {
      console.log(`⚠️  PAGINATION DETECTED: There are more records (offset: ${data.offset})`);
      console.log('The API might be returning paginated results. Let me fetch all pages...\n');
      
      let allRecords = [...data.records];
      let offset = data.offset;
      
      while (offset) {
        const paginatedResponse = await fetch(`${url}?offset=${offset}`, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
        });
        
        if (paginatedResponse.ok) {
          const paginatedData = await paginatedResponse.json();
          allRecords = [...allRecords, ...paginatedData.records];
          offset = paginatedData.offset;
          console.log(`Fetched additional ${paginatedData.records.length} records (total: ${allRecords.length})`);
        } else {
          break;
        }
      }
      
      console.log(`\n🎯 TOTAL RECORDS ACROSS ALL PAGES: ${allRecords.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAirtableShifts();