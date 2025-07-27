// Quick debug script to see your Airtable field structure
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID?.trim();

async function debugAirtable() {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/V%20Shifts`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.records && data.records.length > 0) {
      console.log('First record fields:', JSON.stringify(data.records[0].fields, null, 2));
      console.log('Field names:', Object.keys(data.records[0].fields));
    } else {
      console.log('No records found or empty response');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAirtable();