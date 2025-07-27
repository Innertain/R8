// Quick Airtable table tester
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID;

async function testTable(tableName) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`\n✅ ${tableName}:`);
      console.log(`   Records: ${data.records?.length || 0}`);
      
      if (data.records && data.records.length > 0) {
        console.log(`   Sample fields:`, Object.keys(data.records[0].fields));
        console.log(`   Sample record:`, JSON.stringify(data.records[0].fields, null, 2));
      }
      return true;
    } else {
      console.log(`❌ ${tableName}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${tableName}: ${error.message}`);
    return false;
  }
}

async function testAllTables() {
  const tables = [
    'Drivers',
    'Volunteer Applications', 
    'V Availability',
    'V Shift Assignment',
    'V Shifts',
    'V Activities'
  ];
  
  console.log('Testing Airtable connections...\n');
  
  for (const table of tables) {
    await testTable(table);
  }
}

testAllTables().catch(console.error);