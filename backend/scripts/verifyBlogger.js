import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyBlogger() {
  console.log('\n🔍 --- Blogger Connection Diagnostic ---');
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.BLOGGER_REFRESH_TOKEN;
  const blogId = process.env.BLOGGER_BLOG_ID;

  // 1. Basic Check
  if (!clientId || clientId.includes('YOUR_')) {
    console.log('❌ GOOGLE_CLIENT_ID is missing or not set.');
    return;
  }
  if (!clientSecret || clientSecret.includes('YOUR_')) {
    console.log('❌ GOOGLE_CLIENT_SECRET is missing or not set.');
    return;
  }
  if (!refreshToken || refreshToken.includes('YOUR_')) {
    console.log('❌ BLOGGER_REFRESH_TOKEN is missing or not set.');
    console.log('👉 Tip: Use OAuth 2.0 Playground to generate this.');
    return;
  }

  console.log('✅ Basic configuration present.');

  // 2. Auth Test
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  try {
    console.log('⏳ Testing connection to Google API...');
    const userInfo = await blogger.blogs.listByUser({ userId: 'self' });
    console.log('✅ Connection Successful!');
    console.log(`👤 Account found for ${userInfo.data.items?.[0]?.name || 'unknown'}`);
    
    if (blogId) {
      console.log(`⏳ Verifying Blog ID: ${blogId}...`);
      try {
        const blogInfo = await blogger.blogs.get({ blogId: blogId });
        console.log(`✅ Blog Verified: "${blogInfo.data.name}"`);
        console.log('\n✨ EVERYTHING IS WORKING! You can now sync your blogs.');
      } catch (err) {
        console.log(`❌ BLOGGER_BLOG_ID (${blogId}) is invalid or you don't have access.`);
        console.log('👉 Fix: Run node scripts/findBlogId.js to find the correct ID.');
      }
    } else {
      console.log('⚠️  BLOGGER_BLOG_ID is missing. Use scripts/findBlogId.js to find it.');
    }

  } catch (error) {
    console.log('\n❌ CONNECTION FAILED');
    const errType = error.response?.data?.error || error.message;
    const errDesc = error.response?.data?.error_description || '';

    if (errType === 'deleted_client') {
      console.log('\n🔥 PROBLEM: Your Client ID was deleted in Google Cloud Console.');
      console.log('👉 FIX: Go to https://console.cloud.google.com/apis/credentials');
      console.log('   1. Create a NEW OAuth 2.0 Client ID.');
      console.log('   2. Update your .env with the NEW ID and Secret.');
      console.log('   3. Run node scripts/authenticate.js again.');
    } else if (errType === 'invalid_grant' || (typeof errType === 'string' && errType.includes('unauthorized_client'))) {
      console.log('\n🔥 PROBLEM: Your Refresh Token or Client Secret is invalid/expired.');
      console.log('--------------------------------------------------');
      console.log('⚠️  WHY THIS HAPPENED (LONG-TERM FIX):');
      console.log('1. Your Google project might be in "TESTING" mode.');
      console.log('2. In Testing mode, tokens expire after 7 DAYS.');
      console.log('3. FIX: Go to https://console.cloud.google.com/apis/credentials/consent');
      console.log('   and click "PUBLISH APP" to set it to "IN PRODUCTION".');
      console.log('--------------------------------------------------');
      console.log('👉 QUICK FIX: Run node scripts/authenticate.js to get a new token.');
    } else {
      console.log(`\nTechnical Details: ${errType} - ${errDesc}`);
    }
  }
}

verifyBlogger();
