import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listPosts() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.BLOGGER_REFRESH_TOKEN });

  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  try {
    const response = await blogger.posts.list({
      blogId: process.env.BLOGGER_BLOG_ID,
    });
    const posts = response.data.items || [];
    console.log(`\n📄 --- Posts on Blogger (${posts.length}) ---`);
    posts.forEach((p, i) => {
      console.log(`${i+1}. ${p.title} (${p.url})`);
    });
  } catch (error) {
    console.error("Error listing posts:", error.message);
  }
}

listPosts();
