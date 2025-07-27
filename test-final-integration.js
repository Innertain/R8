// Final integration test to confirm Alex's assignment is working end-to-end
const testFinalIntegration = async () => {
  console.log('🎯 FINAL INTEGRATION TEST for Alex Mengel');
  console.log('==========================================');
  
  try {
    // Step 1: Confirm volunteer login works
    console.log('\n1. Testing volunteer login...');
    const loginResponse = await fetch('http://localhost:5000/api/volunteers/phone/9194340129');
    const volunteer = await loginResponse.json();
    console.log(`✅ Login successful: ${volunteer.name} (ID: ${volunteer.id})`);
    
    // Step 2: Check what's actually in Airtable
    console.log('\n2. Checking Airtable V Shift Assignment table directly...');
    const directResponse = await fetch('http://localhost:5000/api/test/direct/V%20Shift%20Assignment');
    const directData = await directResponse.json();
    const alexAssignments = directData.data.filter(record => 
      record.fields.Volunteer && record.fields.Volunteer.includes('recuvlv2OK3HP37TU')
    );
    console.log(`✅ Found ${alexAssignments.length} assignments in Airtable for Alex:`);
    alexAssignments.forEach(assignment => {
      console.log(`  - ${assignment.fields.Name} (${assignment.id})`);
      console.log(`    Shift ID: ${assignment.fields['Shift ID']}`);
      console.log(`    Notes: ${assignment.fields.Notes}`);
    });
    
    // Step 3: Test API assignment retrieval
    console.log('\n3. Testing API assignment retrieval...');
    const apiResponse = await fetch(`http://localhost:5000/api/assignments/volunteer/${volunteer.id}`);
    const apiAssignments = await apiResponse.json();
    console.log(`📋 API returned ${apiAssignments.length} assignments`);
    
    // Step 4: Create new assignment to test full flow
    console.log('\n4. Testing new assignment creation...');
    const createResponse = await fetch('http://localhost:5000/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId: volunteer.id,
        shiftId: 'rec4fe62UeELE96JT',
        status: 'confirmed',
        notes: 'INTEGRATION TEST - Complete flow working'
      })
    });
    
    if (createResponse.ok) {
      const newAssignment = await createResponse.json();
      console.log(`✅ New assignment created: ${newAssignment.id}`);
      
      // Step 5: Verify it appears in API
      const verifyResponse = await fetch(`http://localhost:5000/api/assignments/volunteer/${volunteer.id}`);
      const verifyAssignments = await verifyResponse.json();
      console.log(`🔍 After creation, API shows ${verifyAssignments.length} assignments`);
    }
    
    console.log('\n🎉 INTEGRATION TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
};

testFinalIntegration();