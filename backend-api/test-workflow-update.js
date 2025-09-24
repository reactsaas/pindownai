// Simple test to update workflow data and see real-time updates
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const testPinId = 'p-O_IVNbyHoSCPYLvjrtx';
const testDatasetId = 'd-O_bdcuXMrLTK-Mkdyfx';

async function updateWorkflowData() {
  const testData = {
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    recordsProcessed: Math.floor(Math.random() * 2000) + 500,
    totalRecords: 2000,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    conversion_rate: Number((Math.random() * 0.2 + 0.1).toFixed(3)),
    api_calls: Math.floor(Math.random() * 1000) + 100,
    health_score: Number((Math.random() * 2 + 8).toFixed(1)),
    uptime: Number((Math.random() * 5 + 95).toFixed(2)),
    lastUpdate: new Date().toISOString()
  };

  try {
    console.log('🚀 Updating workflow data...');
    console.log('📊 Data being sent:', JSON.stringify(testData, null, 2));
    
    const response = await axios.put(`${BASE_URL}/api/pins/${testPinId}/datasets/${testDatasetId}`, {
      data: JSON.stringify(testData)
    });

    if (response.status === 200) {
      console.log('✅ Workflow data updated successfully!');
      console.log('📝 Response:', response.data.data.message);
      console.log('🔄 Check your UI at: http://localhost:3000/pins/p-O_IVNbyHoSCPYLvjrtx?view=dataset');
    } else {
      console.error('❌ Failed to update workflow data:', response.status);
    }
  } catch (error) {
    console.error('❌ Error updating workflow data:', error.response?.data || error.message);
  }
}

// Run the update
updateWorkflowData();





