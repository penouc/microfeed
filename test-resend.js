#!/usr/bin/env node

// Test script for resend email functionality
// Usage: node test-resend.js

import fs from 'fs';

async function testResend() {
  console.log('Testing Resend email functionality...');
  
  // Parse .vars.toml file
  let varsContent;
  try {
    varsContent = fs.readFileSync('.vars.toml', 'utf8');
  } catch (error) {
    console.error('❌ Could not read .vars.toml file:', error.message);
    return;
  }
  
  // Simple TOML parsing for key=value pairs
  const lines = varsContent.split('\n');
  const envVars = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes(' = ')) {
      const [key, ...valueParts] = trimmed.split(' = ');
      let value = valueParts.join(' = ').trim();
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  }
  
  const resendApiKey = envVars.RESEND_API_KEY;
  const notificationEmail = envVars.NOTIFICATION_EMAIL;
  
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY not found in .vars.toml');
    return;
  }
  
  if (!notificationEmail) {
    console.error('❌ NOTIFICATION_EMAIL not found in .vars.toml');
    return;
  }
  
  console.log('✅ Environment variables found:');
  console.log(`   RESEND_API_KEY: ${resendApiKey.substring(0, 8)}...`);
  console.log(`   NOTIFICATION_EMAIL: ${notificationEmail}`);
  
  // Test email content
  const emailContent = `
Test email from microfeed resend functionality

This is a test email to verify that resend is working correctly.

Test Time: ${new Date().toISOString()}
  `;

  try {
    console.log('🚀 Sending test email...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'help@baballm.com',
        to: [notificationEmail],
        subject: 'Test email from microfeed',
        text: emailContent,
      }),
    });

    console.log(`📧 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sent successfully!');
      console.log('   Response:', result);
    } else {
      const error = await response.text();
      console.error('❌ Failed to send email:', error);
      console.error('   Status:', response.status);
      console.error('   Status text:', response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testResend();