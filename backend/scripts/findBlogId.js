import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.BLOGGER_REFRESH_TOKEN,
});

async function listBlogs() {
  try {
    const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
    const res = await blogger.blogs.listByUser({ userId: 'self' });
    
    if (res.data.items) {
      console.log('\n--- Your Blogger Blogs ---');
      res.data.items.forEach(blog => {
        console.log(`Name: ${blog.name}`);
        console.log(`URL: ${blog.url}`);
        console.log(`ID: ${blog.id}`);
        console.log('--------------------------');
      });
      console.log('\nPlease copy the ID of the blog you want to use and put it in your .env as BLOGGER_BLOG_ID\n');
    } else {
      console.log('No blogs found for this account.');
    }
  } catch (error) {
    console.error('Error fetching blogs:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
  }
}

listBlogs();
