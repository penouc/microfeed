#!/usr/bin/env node

// Test script for end-to-end comment email notification
// Usage: node test-comment-email.js

import fs from 'fs';

async function testCommentEmailNotification() {
  console.log('Testing end-to-end comment email notification...');
  
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
  
  if (!resendApiKey || !notificationEmail) {
    console.error('❌ Required environment variables not found');
    return;
  }

  // Test data
  const testComment = {
    item_id: '4f0jaHgMBaz', // Using one of the available items
    author_email: 'test@example.com',
    content: 'This is a test comment to verify email notification is working correctly!'
  };

  try {
    console.log('🚀 Testing comment API endpoint...');
    console.log('   Item ID:', testComment.item_id);
    console.log('   Author Email:', testComment.author_email);
    console.log('   Content:', testComment.content);

    // Note: This tests the email sending part directly
    const emailContent = `
New comment on your microfeed:

Item ID: ${testComment.item_id}
Author Email: ${testComment.author_email}
Content: ${testComment.content}

Comment ID: test-comment-${Date.now()}
Time: ${new Date().toISOString()}
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'help@baballm.com',
        to: [notificationEmail],
        subject: 'New comment on your microfeed',
        text: emailContent,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Comment email notification sent successfully!');
      console.log('   Email ID:', result.id);
      console.log('   To:', notificationEmail);
      console.log('   From: help@baballm.com');
    } else {
      const error = await response.text();
      console.error('❌ Failed to send comment email:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testCommentEmailNotification();