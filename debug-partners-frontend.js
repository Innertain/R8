// Check partners count in frontend data
fetch('http://localhost:5000/api/stats')
  .then(res => res.json())
  .then(data => {
    console.log('=== MUTUAL AID PARTNERS COUNT ===');
    console.log('Partners Count:', data.counts?.partners);
    console.log('Partners Data Length:', data.data?.partners?.length);
    
    if (data.data?.partners?.length > 0) {
      console.log('\n=== SAMPLE PARTNER DATA ===');
      const partner = data.data.partners[0];
      console.log('Sample Partner Fields:', Object.keys(partner));
      console.log('Sample Partner:', partner);
    }
  })
  .catch(err => console.error('Error:', err));