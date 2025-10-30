#!/usr/bin/env ts-node

/**
 * Test script for resume endpoints
 * Tests the fixed resume parsing and listing functionality
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

async function testResumeUpload(): Promise<string | null> {
  try {
    console.log('\n📤 Testing Resume Upload...');
    
    // Create a test PDF file if it doesn't exist
    const testFilePath = path.join(__dirname, 'test-resume.txt');
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'Test Resume Content\n\nSkills: JavaScript, TypeScript, Node.js\n\nExperience:\nSoftware Engineer at Tech Corp\n2020 - Present\n\nEducation:\nBachelor of Science in Computer Science\nUniversity of Technology\n2020');
    }
    
    const form = new FormData();
    form.append('resume', fs.createReadStream(testFilePath), {
      filename: 'test-resume.pdf',
      contentType: 'application/pdf',
    });
    
    const response = await axios.post(
      `${API_BASE_URL}/candidate/resume/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    );
    
    if (response.status === 201 && response.data.resume?.id) {
      results.push({
        test: 'Resume Upload',
        status: 'PASS',
        message: 'Resume uploaded successfully',
        data: response.data.resume,
      });
      console.log('✅ Upload successful:', response.data.resume.id);
      return response.data.resume.id;
    } else {
      results.push({
        test: 'Resume Upload',
        status: 'FAIL',
        message: 'Unexpected response format',
        data: response.data,
      });
      console.log('❌ Upload failed: Unexpected response');
      return null;
    }
  } catch (error: any) {
    results.push({
      test: 'Resume Upload',
      status: 'FAIL',
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    console.log('❌ Upload failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testResumeParsing(resumeId: string): Promise<boolean> {
  try {
    console.log('\n🔍 Testing Resume Parsing...');
    
    const response = await axios.post(
      `${API_BASE_URL}/candidate/resume/parse`,
      { resumeId },
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.status === 201 && response.data.version) {
      results.push({
        test: 'Resume Parsing',
        status: 'PASS',
        message: 'Resume parsed successfully',
        data: {
          versionId: response.data.version.id,
          skillsCount: response.data.version.parsedData?.skills?.length || 0,
          experienceCount: response.data.version.parsedData?.experience?.length || 0,
          educationCount: response.data.version.parsedData?.education?.length || 0,
        },
      });
      console.log('✅ Parsing successful');
      console.log('   Skills found:', response.data.version.parsedData?.skills?.length || 0);
      console.log('   Experience entries:', response.data.version.parsedData?.experience?.length || 0);
      console.log('   Education entries:', response.data.version.parsedData?.education?.length || 0);
      return true;
    } else {
      results.push({
        test: 'Resume Parsing',
        status: 'FAIL',
        message: 'Unexpected response format',
        data: response.data,
      });
      console.log('❌ Parsing failed: Unexpected response');
      return false;
    }
  } catch (error: any) {
    results.push({
      test: 'Resume Parsing',
      status: 'FAIL',
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    console.log('❌ Parsing failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testResumeListing(): Promise<boolean> {
  try {
    console.log('\n📋 Testing Resume Listing...');
    
    const response = await axios.get(`${API_BASE_URL}/candidate/resumes`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });
    
    if (response.status === 200 && Array.isArray(response.data.resumes)) {
      results.push({
        test: 'Resume Listing',
        status: 'PASS',
        message: 'Resumes listed successfully',
        data: {
          count: response.data.resumes.length,
          resumes: response.data.resumes.map((r: any) => ({
            id: r.id,
            fileName: r.fileName,
            versionsCount: r.versions?.length || 0,
          })),
        },
      });
      console.log('✅ Listing successful');
      console.log('   Total resumes:', response.data.resumes.length);
      response.data.resumes.forEach((resume: any) => {
        console.log(`   - ${resume.fileName} (${resume.versions?.length || 0} versions)`);
      });
      return true;
    } else {
      results.push({
        test: 'Resume Listing',
        status: 'FAIL',
        message: 'Unexpected response format',
        data: response.data,
      });
      console.log('❌ Listing failed: Unexpected response');
      return false;
    }
  } catch (error: any) {
    results.push({
      test: 'Resume Listing',
      status: 'FAIL',
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    console.log('❌ Listing failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testResumeDelete(resumeId: string): Promise<boolean> {
  try {
    console.log('\n🗑️  Testing Resume Deletion...');
    
    const response = await axios.delete(`${API_BASE_URL}/candidate/resume/${resumeId}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });
    
    if (response.status === 200) {
      results.push({
        test: 'Resume Deletion',
        status: 'PASS',
        message: 'Resume deleted successfully',
      });
      console.log('✅ Deletion successful');
      return true;
    } else {
      results.push({
        test: 'Resume Deletion',
        status: 'FAIL',
        message: 'Unexpected response',
        data: response.data,
      });
      console.log('❌ Deletion failed: Unexpected response');
      return false;
    }
  } catch (error: any) {
    results.push({
      test: 'Resume Deletion',
      status: 'FAIL',
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    console.log('❌ Deletion failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Resume Endpoints Test Suite');
  console.log('================================');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Auth Token: ${AUTH_TOKEN ? '✓ Provided' : '✗ Missing'}`);
  
  if (!AUTH_TOKEN) {
    console.log('\n❌ Error: TEST_AUTH_TOKEN environment variable is required');
    console.log('Usage: TEST_AUTH_TOKEN=your_token npm run test:resume-endpoints');
    process.exit(1);
  }
  
  // Run tests in sequence
  const resumeId = await testResumeUpload();
  
  if (resumeId) {
    await testResumeParsing(resumeId);
    await testResumeListing();
    await testResumeDelete(resumeId);
  }
  
  // Print summary
  console.log('\n📊 Test Summary');
  console.log('================================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });
  
  console.log('\n================================');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
