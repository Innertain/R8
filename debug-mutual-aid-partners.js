// Check for mutual aid partners data in various tables
const baseUrl = 'http://localhost:5000';

async function checkMutualAidPartners() {
  try {
    console.log('=== CHECKING FOR MUTUAL AID PARTNERS ===');
    
    // Check if there's a dedicated partners/hosts table
    const possibleTables = ['Partners', 'Hosts', 'Mutual Aid Partners', 'Organizations'];
    
    for (const table of possibleTables) {
      try {
        const response = await fetch(`${baseUrl}/api/test/direct/${encodeURIComponent(table)}`);
        const data = await response.json();
        
        if (data.success) {
          console.log(`✓ Found table: "${table}" with ${data.records} records`);
          if (data.data && data.data.length > 0) {
            console.log('Sample record fields:', Object.keys(data.data[0]));
          }
        }
      } catch (err) {
        console.log(`✗ Table "${table}" not found`);
      }
    }
    
    // Check existing data for partner references
    const statsResponse = await fetch(`${baseUrl}/api/stats`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      // Check sites for partner/host references
      const sites = statsData.data.sites || [];
      const siteFields = sites.length > 0 ? Object.keys(sites[0]) : [];
      const partnerFields = siteFields.filter(field => 
        field.toLowerCase().includes('partner') || 
        field.toLowerCase().includes('host') ||
        field.toLowerCase().includes('organization') ||
        field.toLowerCase().includes('sponsor')
      );
      
      console.log('\n=== SITE FIELDS RELATED TO PARTNERS ===');
      console.log('Partner-related fields in sites:', partnerFields);
      
      // Check deliveries for partner references
      const deliveries = statsData.data.deliveries || [];
      const deliveryFields = deliveries.length > 0 ? Object.keys(deliveries[0]) : [];
      const deliveryPartnerFields = deliveryFields.filter(field => 
        field.toLowerCase().includes('partner') || 
        field.toLowerCase().includes('host') ||
        field.toLowerCase().includes('organization') ||
        field.toLowerCase().includes('sponsor')
      );
      
      console.log('Partner-related fields in deliveries:', deliveryPartnerFields);
      
      // Sample data
      if (sites.length > 0) {
        console.log('\n=== SAMPLE SITE DATA ===');
        const sampleSite = sites[0];
        partnerFields.forEach(field => {
          console.log(`${field}:`, sampleSite[field]);
        });
      }
      
      if (deliveries.length > 0) {
        console.log('\n=== SAMPLE DELIVERY DATA ===');
        const sampleDelivery = deliveries[0];
        deliveryPartnerFields.forEach(field => {
          console.log(`${field}:`, sampleDelivery[field]);
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking mutual aid partners:', error);
  }
}

checkMutualAidPartners();