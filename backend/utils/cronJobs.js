import cron from 'node-cron';
import { bloggerService } from './bloggerService.js';

/**
 * Initialize all cron jobs for the backend
 */
export const initCronJobs = () => {
    console.log("⏰ Background Schedulers Initialized.");

    // Job: Sync Pending Blogs to Blogger
    // Schedule: Runs every 15 minutes
    // Corresponds to: Minutes 0, 15, 30, 45 of every hour
    cron.schedule('0,15,30,45 * * * *', async () => {
        try {
            const result = await bloggerService.syncAllPendingBlogs();
            if (result.success && result.count > 0) {
                console.log(`✅ Background Job Completed: Successfully synced ${result.count} blog(s).`);
            } else if (result.success && result.count === 0 && !result.message) {
                // Only log if something was found but failed. 
                // We'll skip logging "Nothing to sync" every 15 mins to keep logs clean.
            }
        } catch (error) {
            console.error("❌ Background Job (SyncBlogs) Error:", error.message);
        }
    });

    // Optional: One-time sync on server start (with a delay to ensure DB connection is ready)
    setTimeout(async () => {
        console.log("🚀 Server Start Sync: Checking for pending blogs...");
        await bloggerService.syncAllPendingBlogs();
    }, 10000); // 10s delay
};
