// Debug state data processing
fetch('http://localhost:5000/api/stats')
  .then(res => res.json())
  .then(data => {
    console.log('=== STATE DATA DEBUGGING ===');
    
    // Check sites data
    if (data.data?.sites?.length > 0) {
      const siteStates = data.data.sites.slice(0, 5).map(site => ({
        id: site.id,
        State: site.State,
        'Site Name': site['Site Name']
      }));
      console.log('Sample Site States:', siteStates);
      
      const stateDistribution = {};
      data.data.sites.forEach(site => {
        const state = site.State || 'Unknown';
        stateDistribution[state] = (stateDistribution[state] || 0) + 1;
      });
      console.log('Sites by State:', stateDistribution);
    }
    
    // Check deliveries data
    if (data.data?.deliveries?.length > 0) {
      const deliveryStates = data.data.deliveries.slice(0, 5).map(delivery => ({
        id: delivery.id,
        State: delivery.State,
        'Delivery State': delivery['Delivery State'],
        'Drop Off Site': delivery['Drop Off Site']
      }));
      console.log('Sample Delivery States:', deliveryStates);
      
      const deliveryStateDistribution = {};
      data.data.deliveries.forEach(delivery => {
        const state = delivery.State || delivery['Delivery State'] || 'Unknown';
        deliveryStateDistribution[state] = (deliveryStateDistribution[state] || 0) + 1;
      });
      console.log('Deliveries by State:', deliveryStateDistribution);
    }
  })
  .catch(err => console.error('Error:', err));