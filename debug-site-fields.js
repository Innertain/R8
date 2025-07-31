// Check site fields for families data
fetch('http://localhost:5000/api/debug/site-fields')
  .then(res => res.json())
  .then(data => {
    console.log('=== SITE FIELDS ANALYSIS ===');
    console.log('All Site Fields:', data.analysis.allFields);
    console.log('Family-like Fields:', data.analysis.familyLikeFields);
    console.log('Sample Site Data:', data.analysis.sampleSite);
  })
  .catch(err => console.error('Error:', err));