// Quick script to analyze delivery status values
fetch('http://localhost:5000/api/debug/delivery-statuses')
  .then(res => res.json())
  .then(data => {
    console.log('=== DELIVERY STATUS ANALYSIS ===');
    console.log('Driver Statuses:', data.analysis.driverStatuses);
    console.log('General Statuses:', data.analysis.statuses);
    console.log('Status-like Fields:', data.analysis.statusLikeFields);
    console.log('Sample Records:', JSON.stringify(data.analysis.sampleRecords, null, 2));
  })
  .catch(err => console.error('Error:', err));