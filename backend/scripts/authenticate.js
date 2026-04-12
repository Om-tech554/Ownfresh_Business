import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runAuth() {
  console.log('\n🚀 --- Blogger Automated Setup (Long-Term Fix) ---');
  console.log('--------------------------------------------------');
  console.log('⚠️  IMPORTANT FOR LONG-TERM USE:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials/consent');
  console.log('2. Ensure "Publishing status" is set to "IN PRODUCTION".');
  console.log('   - If it says "Testing", your token will expire in 7 DAYS.');
  console.log('   - Click "PUBLISH APP" to make it permanent.');
  console.log('--------------------------------------------------\n');
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.includes('YOUR_')) {
     console.log('❌ Error: GOOGLE_CLIENT_ID is missing in your .env file.');
     process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob' 
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/blogger'],
    prompt: 'consent' // Forces a new refresh token
  });

  console.log('1. 🔗 Open this URL in your browser to authorize:');
  console.log('--------------------------------------------------');
  console.log(authUrl);
  console.log('--------------------------------------------------\n');

  rl.question('2. 🔑 Paste the "Authorization Code" here: ', async (code) => {
    try {
      console.log('⏳ Exchanging code for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      const refreshToken = tokens.refresh_token;

      if (!refreshToken) {
        console.log('\n❌ Error: Did not receive a Refresh Token.');
        console.log('👉 Tip: You may already have a token. To force a new one, ensure you clicked "Allow"');
        console.log('   and that you see "consent" prompted in the browser.');
        process.exit(1);
      }

      // 3. Update .env file
      console.log('📝 Updating .env file with fresh Refresh Token...');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      const refreshRegex = /BLOGGER_REFRESH_TOKEN=.*/;
      if (refreshRegex.test(envContent)) {
        envContent = envContent.replace(refreshRegex, `BLOGGER_REFRESH_TOKEN="${refreshToken}"`);
      } else {
        envContent += `\nBLOGGER_REFRESH_TOKEN="${refreshToken}"`;
      }

      // 4. Auto-find Blog ID
      console.log('🔍 Finding your Blogger ID...');
      oauth2Client.setCredentials(tokens);
      const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
      const blogs = await blogger.blogs.listByUser({ userId: 'self' });
      
      if (blogs.data.items && blogs.data.items.length > 0) {
        const blogId = blogs.data.items[0].id;
        console.log(`✅ Found Blog: "${blogs.data.items[0].name}" (ID: ${blogId})`);
        
        const blogIdRegex = /BLOGGER_BLOG_ID=.*/;
        if (blogIdRegex.test(envContent)) {
          envContent = envContent.replace(blogIdRegex, `BLOGGER_BLOG_ID="${blogId}"`);
        } else {
          envContent += `\nBLOGGER_BLOG_ID="${blogId}"`;
        }
      }

      fs.writeFileSync(envPath, envContent);
      console.log('\n✨ SETUP COMPLETE! Your .env has been updated.');
      console.log('🚀 You can now run: node scripts/syncAllBlogs.js');
      process.exit(0);
      
    } catch (err) {
      console.error('\n❌ Error during setup:', err.response?.data?.error_description || err.message);
      if (err.message.includes('redirect_uri_mismatch')) {
        console.log('👉 Fix: Ensure your Client ID in Google Console has "urn:ietf:wg:oauth:2.0:oob" as a redirect URI.');
      }
      process.exit(1);
    }
  });
}

runAuth();
