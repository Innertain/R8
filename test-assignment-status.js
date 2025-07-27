// Quick test to verify Alex's shift assignment
const testAssignment = async () => {
  try {
    console.log('Testing Alex Mengel assignment status...');
    
    // Test volunteer lookup
    const volunteerResponse = await fetch('http://localhost:5000/api/volunteers/phone/9194340129');
    const volunteer = await volunteerResponse.json();
    console.log('✅ Volunteer found:', volunteer.name, '- ID:', volunteer.id);
    
    // Test assignments for this volunteer
    const assignmentResponse = await fetch(`http://localhost:5000/api/assignments/volunteer/${volunteer.id}`);
    const assignments = await assignmentResponse.json();
    console.log('📋 Current assignments:', assignments.length);
    
    if (assignments.length > 0) {
      assignments.forEach(assignment => {
        console.log(`  - Shift: ${assignment.shiftId}`);
        console.log(`  - Status: ${assignment.status}`);
        console.log(`  - Assigned: ${assignment.assignedAt}`);
        console.log(`  - Notes: ${assignment.notes}`);
      });
    }
    
    // Test shifts to see current volunteer counts
    const shiftsResponse = await fetch('http://localhost:5000/api/shifts');
    const shifts = await shiftsResponse.json();
    const riverCleanup = shifts.find(s => s.id === 'rec4fe62UeELE96JT');
    if (riverCleanup) {
      console.log('🌊 River Cleanup Shift:');
      console.log(`  - Activity: ${riverCleanup.activityName}`);
      console.log(`  - Volunteers: ${riverCleanup.volunteersSignedUp}/${riverCleanup.volunteersNeeded}`);
      console.log(`  - Status: ${riverCleanup.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testAssignment();