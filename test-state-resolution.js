// Test the state resolution logic
fetch('http://localhost:5000/api/stats')
  .then(res => res.json())
  .then(data => {
    console.log('=== TESTING STATE RESOLUTION LOGIC ===');
    
    // Create site lookup map
    const siteStateMap = new Map();
    data.data.sites.forEach(site => {
      siteStateMap.set(site.id, site.State);
    });
    
    console.log('Site State Map (first 5 entries):');
    const entries = Array.from(siteStateMap.entries()).slice(0, 5);
    entries.forEach(([id, state]) => console.log(`${id} -> ${state}`));
    
    // Test delivery state resolution
    console.log('\n=== DELIVERY STATE RESOLUTION ===');
    const deliveriesWithStates = data.data.deliveries.slice(0, 10).map(delivery => {
      let deliveryState = delivery.State || delivery['Delivery State'];
      
      if (!deliveryState && delivery['Drop Off Site']?.length > 0) {
        const dropOffSiteId = delivery['Drop Off Site'][0];
        deliveryState = siteStateMap.get(dropOffSiteId);
      }
      
      return {
        id: delivery.id,
        originalState: delivery.State,
        dropOffSite: delivery['Drop Off Site'],
        resolvedState: deliveryState
      };
    });
    
    console.log('Delivery State Resolution Test:');
    deliveriesWithStates.forEach(d => console.log(d));
    
    // Count states after resolution
    const stateCount = {};
    data.data.deliveries.forEach(delivery => {
      let deliveryState = delivery.State || delivery['Delivery State'];
      
      if (!deliveryState && delivery['Drop Off Site']?.length > 0) {
        const dropOffSiteId = delivery['Drop Off Site'][0];
        deliveryState = siteStateMap.get(dropOffSiteId);
      }
      
      const finalState = deliveryState || 'Unknown';
      stateCount[finalState] = (stateCount[finalState] || 0) + 1;
    });
    
    console.log('\n=== DELIVERY COUNTS BY RESOLVED STATE ===');
    console.log(stateCount);
  })
  .catch(err => console.error('Error:', err));