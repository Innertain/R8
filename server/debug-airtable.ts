// Quick debug script to test Airtable access
const baseId = process.env.VITE_BASE_ID;
const token = process.env.AIRTABLE_TOKEN;

console.log('=== Airtable Debug Test ===');
console.log('Base ID:', baseId);
console.log('Token exists:', !!token);
console.log('Token prefix:', token?.substring(0, 10) + '...');

async function testTable(tableName: string) {
  console.log(`\nTesting table: "${tableName}"`);
  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Success: ${data.records?.length || 0} records`);
      if (data.records?.[0]) {
        console.log('Sample fields:', Object.keys(data.records[0].fields || {}));
      }
    } else {
      const errorText = await response.text();
      console.log(`✗ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`✗ Exception: ${error.message}`);
  }
}

// Test the tables we know exist
async function runTests() {
  await testTable('V Shifts');  // This works
  await testTable('Drivers');
  await testTable('Volunteer Applications');
  await testTable('V Availability');
  await testTable('V Shift Assignment');
}

runTests();