// Use built-in fetch available in Node 18+

async function checkAirtableHost() {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.VITE_BASE_ID;

  try {
    console.log('=== V Shifts Table Structure ===');
    const shiftsResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/V%20Shifts`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
    });
    const shiftsData = await shiftsResponse.json();
    
    if (shiftsData.records && shiftsData.records.length > 0) {
      console.log('V Shifts record fields:');
      console.log(JSON.stringify(shiftsData.records[0].fields, null, 2));
    }

    console.log('\n=== Mutual Aid Partners Table Structure ===');
    const partnersResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Mutual%20Aid%20Partners`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
    });
    const partnersData = await partnersResponse.json();
    
    if (partnersData.records && partnersData.records.length > 0) {
      console.log('Mutual Aid Partners record fields:');
      console.log(JSON.stringify(partnersData.records[0].fields, null, 2));
      console.log('\nAll partners:');
      partnersData.records.forEach((record, i) => {
        console.log(`${i + 1}. ${record.fields.Name || 'No Name'} (ID: ${record.id})`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAirtableHost();