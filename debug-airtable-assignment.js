// Debug Airtable V Shift Assignment table structure and create test record
const debugAirtableAssignment = async () => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = 'appkWSrDxiLEwRE7m';
  
  console.log('🔍 Debugging V Shift Assignment table...');
  
  try {
    // First, check what fields exist in the table
    const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
    
    const metaData = await metaResponse.json();
    const assignmentTable = metaData.tables.find(t => t.name === 'V Shift Assignment');
    
    if (assignmentTable) {
      console.log('📋 V Shift Assignment table fields:');
      assignmentTable.fields.forEach(field => {
        console.log(`  - ${field.name} (${field.type})`);
        if (field.type === 'singleSelect' && field.options) {
          console.log(`    Options: ${field.options.choices.map(c => c.name).join(', ')}`);
        }
      });
    }
    
    // Try to create a test assignment record
    console.log('\n🧪 Testing assignment creation...');
    
    const testPayload = {
      records: [{
        fields: {
          'Name': 'River Cleanup Assignment - Alex Mengel',
          'Volunteer': ['recuvlv2OK3HP37TU'], // Alex's volunteer ID
          'Shift ID': 'rec4fe62UeELE96JT', // River cleanup shift
          // 'Status ': 'confirmed', // Skip status for now to avoid permissions issue
          'Assigned Date': new Date().toISOString(),
          'Notes': 'Test assignment from API - Alex signed up for river cleanup'
        }
      }]
    };
    
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const createResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/V%20Shift%20Assignment`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Assignment created successfully:', result.records[0].id);
      console.log('Field values:', result.records[0].fields);
    } else {
      console.log('❌ Assignment creation failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

// Run the debug
debugAirtableAssignment();