// Debug cache response structure
fetch('http://localhost:5000/api/stats')
  .then(res => res.json())
  .then(data => {
    console.log('=== CACHE RESPONSE DEBUGGING ===');
    console.log('Response keys:', Object.keys(data));
    console.log('Cached:', data.cached);
    console.log('Last Updated:', data.lastUpdated);
    console.log('Data keys:', Object.keys(data.data || {}));
    console.log('Counts keys:', Object.keys(data.counts || {}));
  })
  .catch(err => console.error('Error:', err));