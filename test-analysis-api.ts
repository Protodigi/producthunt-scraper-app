/**
 * Test script for analysis API endpoints
 * Run with: npx tsx test-analysis-api.ts
 */

const BASE_URL = 'http://localhost:3000';

async function testAnalysisEndpoints() {
  console.log('Testing Analysis API Endpoints...\n');

  // Test 1: Get all analysis reports
  console.log('1. Testing GET /api/analysis');
  try {
    const response = await fetch(`${BASE_URL}/api/analysis`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Test 2: Get analysis reports with pagination
  console.log('2. Testing GET /api/analysis with pagination');
  try {
    const response = await fetch(`${BASE_URL}/api/analysis?page=1&pageSize=5`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Test 3: Get analysis reports with filters
  console.log('3. Testing GET /api/analysis with filters');
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 days ago
    const endDate = new Date();
    
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sortBy: 'productsAnalyzed',
      sortOrder: 'desc'
    });
    
    const response = await fetch(`${BASE_URL}/api/analysis?${params}`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Test 4: Get specific analysis report (assuming ID 1 exists)
  console.log('4. Testing GET /api/analysis/1');
  try {
    const response = await fetch(`${BASE_URL}/api/analysis/1`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Test 5: Test invalid ID
  console.log('5. Testing GET /api/analysis/invalid-id');
  try {
    const response = await fetch(`${BASE_URL}/api/analysis/invalid-id`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Test 6: Test non-existent ID
  console.log('6. Testing GET /api/analysis/999999');
  try {
    const response = await fetch(`${BASE_URL}/api/analysis/999999`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
testAnalysisEndpoints()
  .then(() => console.log('\nTests completed!'))
  .catch(console.error);