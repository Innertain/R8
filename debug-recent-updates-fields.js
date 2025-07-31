// Debug recent updates field structure
const fetch = require('node-fetch');

async function debugFields() {
  try {
    const response = await fetch('http://localhost:5000/api/recent-updates');
    const data = await response.json();
    
    console.log('=== RECENT UPDATES FIELD ANALYSIS ===');
    
    if (data.success && data.data) {
      console.log('\n--- INVENTORY RECORD FIELDS (first 3) ---');
      data.data.inventory.slice(0, 3).forEach((record, i) => {
        console.log(`\nInventory Record ${i + 1} fields:`, Object.keys(record.fields || {}));
        console.log('Fields data:', record.fields);
      });
      
      console.log('\n--- NEEDS RECORD FIELDS (first 3) ---');
      data.data.needs.slice(0, 3).forEach((record, i) => {
        console.log(`\nNeeds Record ${i + 1} fields:`, Object.keys(record.fields || {}));
        console.log('Fields data:', record.fields);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debugFields();