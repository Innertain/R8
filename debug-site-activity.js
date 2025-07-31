// Check site activity tracking for last 60 days
fetch('http://localhost:5000/api/stats')
  .then(res => res.json())
  .then(data => {
    console.log('=== SITE ACTIVITY ANALYSIS ===');
    console.log('Total Sites:', data.counts?.sites);
    console.log('Active Sites (60 days):', data.counts?.activeSitesLast60Days);
    console.log('Sites with Deliveries:', data.counts?.sitesWithDeliveries);
    console.log('Sites with Recent Activity:', data.counts?.sitesWithRecentActivity);
    
    // Check sample site data for date fields
    if (data.data?.sites?.length > 0) {
      const sampleSite = data.data.sites[0];
      console.log('\n=== SAMPLE SITE DATE FIELDS ===');
      console.log('Last Modified:', sampleSite['Last Modified']);
      console.log('Date Created:', sampleSite['Date Created']);
      console.log('Last Update:', sampleSite['Last Update']);
      console.log('Needs Count:', sampleSite['Needs Count']);
    }
  })
  .catch(err => console.error('Error:', err));