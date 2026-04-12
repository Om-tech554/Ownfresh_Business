import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Blog from '../models/blogModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

if (!process.env.BLOGGER_REFRESH_TOKEN) {
  console.warn("⚠️  Blogger Error: BLOGGER_REFRESH_TOKEN is missing in .env. Connectivity will fail.");
}

oauth2Client.setCredentials({
  refresh_token: process.env.BLOGGER_REFRESH_TOKEN,
});

const blogger = google.blogger({
  version: 'v3',
  auth: oauth2Client,
});

const BLOG_ID = process.env.BLOGGER_BLOG_ID;

/**
 * Sync logic for Blogger API
 */
export const bloggerService = {
  /**
   * Create a post on Blogger
   */
  createPost: async ({ title, content, labels, isDraft, location, publishedAt }) => {
    try {
      if (!BLOG_ID) throw new Error("BLOGGER_BLOG_ID is missing in .env");

      const response = await blogger.posts.insert({
        blogId: BLOG_ID,
        isDraft: isDraft || false,
        requestBody: {
          title,
          content,
          labels,
          location: location || undefined,
          published: publishedAt || undefined,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.error("Blogger API Error (Create):", errMsg);
      return { success: false, error: errMsg };
    }
  },

  /**
   * Update an existing post on Blogger
   */
  updatePost: async (postId, { title, content, labels, isDraft, location, publishedAt }) => {
    try {
      if (!BLOG_ID) throw new Error("BLOGGER_BLOG_ID is missing in .env");

      const response = await blogger.posts.patch({
        blogId: BLOG_ID,
        postId: postId,
        isDraft: isDraft || false,
        requestBody: {
          title,
          content,
          labels,
          location: location || undefined,
          published: publishedAt || undefined,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.error("Blogger API Error (Update):", errMsg);
      return { success: false, error: errMsg };
    }
  },

  /**
   * Delete a post from Blogger
   */
  deletePost: async (postId) => {
    try {
      if (!BLOG_ID) throw new Error("BLOGGER_BLOG_ID is missing in .env");

      await blogger.posts.delete({
        blogId: BLOG_ID,
        postId: postId,
      });

      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.error("Blogger API Error (Delete):", errMsg);
      return { success: false, error: errMsg };
    }
  },
  /**
   * Sync all pending blogs to Blogger (Bulk Sync)
   */
  syncAllPendingBlogs: async () => {
    try {
      console.log("🔄 Background Sync: Checking for unsynced blogs...");
      
      const blogsToSync = await Blog.find({ 
        $or: [
          { bloggerId: { $exists: false } },
          { bloggerId: null },
          { bloggerId: "" }
        ]
      });

      if (blogsToSync.length === 0) {
        return { success: true, count: 0, message: "All blogs are already synced." };
      }

      console.log(`📝 Background Sync: Found ${blogsToSync.length} blogs to synchronize.`);
      let successCount = 0;

      for (const blog of blogsToSync) {
        const result = await bloggerService.createPost({
          title: blog.title,
          content: blog.description,
          labels: blog.labels || [],
          isDraft: blog.status === "DRAFT",
          location: blog.location,
          publishedAt: blog.publishedAt
        });

        if (result.success && result.data?.id) {
          blog.bloggerId = result.data.id;
          await blog.save();
          successCount++;
          // Delay to stay within API rate limits
          await new Promise(r => setTimeout(r, 5000));
        } else if (result.error && result.error.includes("permission")) {
          console.warn(`🛑 Quota hit for "${blog.title}". Stopping background sync for today.`);
          break; // Stop loop if we hit the limit
        }
      }

      return { success: true, count: successCount };
    } catch (error) {
      console.error("🔥 Background Sync Error:", error.message);
      return { success: false, error: error.message };
    }
  },
};
