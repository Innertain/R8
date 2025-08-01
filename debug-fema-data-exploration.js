// FEMA Data Exploration Script
// Let's investigate what additional data fields are available in the FEMA datasets

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID;

async function exploreFemaData() {
  console.log('\n🔍 FEMA Data Deep Dive - Exploring Available Fields and Content');
  console.log('=====================================================================\n');

  try {
    // Fetch raw FEMA data
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Recent%20FEMA%20Disasters`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📊 Total FEMA Records Found: ${data.records.length}\n`);

    // Analyze all available fields across all records
    const allFields = new Set();
    const fieldExamples = {};
    const namedStorms = [];
    const interestingRecords = [];

    data.records.forEach((record, index) => {
      const fields = record.fields;
      
      // Collect all field names
      Object.keys(fields).forEach(fieldName => {
        allFields.add(fieldName);
        
        // Store examples for each field
        if (!fieldExamples[fieldName]) {
          fieldExamples[fieldName] = [];
        }
        if (fieldExamples[fieldName].length < 3 && fields[fieldName]) {
          fieldExamples[fieldName].push(fields[fieldName]);
        }
      });

      // Look for named storms
      const title = fields.title || '';
      const description = fields.description || '';
      const incidentType = fields.incidentType || '';
      
      if (title.toLowerCase().includes('hurricane') || 
          title.toLowerCase().includes('helene') || 
          title.toLowerCase().includes('milton') || 
          title.toLowerCase().includes('ian') || 
          title.toLowerCase().includes('florence') || 
          title.toLowerCase().includes('michael') ||
          description.toLowerCase().includes('hurricane') ||
          incidentType.toLowerCase().includes('hurricane')) {
        namedStorms.push({
          disasterNumber: fields.disasterNumber,
          title: title,
          description: description,
          incidentType: incidentType,
          state: fields.state,
          declarationDate: fields.declarationDate
        });
      }

      // Look for interesting/detailed records
      if ((description && description.length > 100) || 
          (title && title.toLowerCase().includes('hurricane')) ||
          (fields.designatedArea && fields.designatedArea.length > 50)) {
        interestingRecords.push({
          index,
          disasterNumber: fields.disasterNumber,
          title: title.substring(0, 80) + (title.length > 80 ? '...' : ''),
          hasDescription: !!description,
          descriptionLength: description ? description.length : 0,
          designatedArea: fields.designatedArea?.substring(0, 100) + (fields.designatedArea?.length > 100 ? '...' : '') || 'None'
        });
      }
    });

    // Display all available fields
    console.log('📋 ALL AVAILABLE FIELDS IN FEMA DATA:');
    console.log('=====================================');
    Array.from(allFields).sort().forEach((field, index) => {
      const examples = fieldExamples[field] || [];
      console.log(`${index + 1}. ${field}`);
      if (examples.length > 0) {
        examples.forEach((example, i) => {
          const displayExample = typeof example === 'string' && example.length > 80 
            ? example.substring(0, 80) + '...' 
            : example;
          console.log(`   Example ${i + 1}: ${displayExample}`);
        });
      }
      console.log('');
    });

    // Display named storms found
    console.log('\n🌀 NAMED STORMS FOUND:');
    console.log('======================');
    if (namedStorms.length > 0) {
      namedStorms.forEach((storm, index) => {
        console.log(`${index + 1}. Disaster #${storm.disasterNumber} - ${storm.state}`);
        console.log(`   Title: ${storm.title}`);
        console.log(`   Type: ${storm.incidentType}`);
        console.log(`   Date: ${storm.declarationDate}`);
        if (storm.description) {
          console.log(`   Description: ${storm.description.substring(0, 200)}${storm.description.length > 200 ? '...' : ''}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No named storms found in current dataset');
    }

    // Display most interesting records
    console.log('\n📖 MOST DETAILED RECORDS:');
    console.log('=========================');
    interestingRecords.slice(0, 10).forEach((record, index) => {
      console.log(`${index + 1}. Disaster #${record.disasterNumber}`);
      console.log(`   Title: ${record.title}`);
      console.log(`   Has Description: ${record.hasDescription} (${record.descriptionLength} chars)`);
      console.log(`   Designated Area: ${record.designatedArea}`);
      console.log('');
    });

    // Sample a few complete records
    console.log('\n🔬 SAMPLE COMPLETE RECORDS:');
    console.log('===========================');
    data.records.slice(0, 3).forEach((record, index) => {
      console.log(`\nSample Record ${index + 1}:`);
      console.log('Fields available:');
      Object.entries(record.fields).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 100 
          ? value.substring(0, 100) + '...' 
          : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    });

    console.log('\n✅ FEMA Data Exploration Complete!');
    console.log(`Total Fields Available: ${allFields.size}`);
    console.log(`Named Storms Found: ${namedStorms.length}`);
    console.log(`Detailed Records: ${interestingRecords.length}`);

  } catch (error) {
    console.error('❌ Error exploring FEMA data:', error);
  }
}

// Run the exploration
exploreFemaData();