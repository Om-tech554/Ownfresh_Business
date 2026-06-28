/**
 * Mocked sync logic for Blogger API to eliminate invalid_grant errors
 * while keeping local admin blog logic completely working.
 */
export const bloggerService = {
  /**
   * Mock creating a post on Blogger
   */
  createPost: async ({ title, content, labels, isDraft, location, publishedAt }) => {
    console.log("ℹ️  Blogger Sync is disabled. Mocking post creation.");
    return { success: true, data: { id: null } };
  },

  /**
   * Mock updating an existing post on Blogger
   */
  updatePost: async (postId, { title, content, labels, isDraft, location, publishedAt }) => {
    console.log(`ℹ️  Blogger Sync is disabled. Mocking post update for ID: ${postId}`);
    return { success: true };
  },

  /**
   * Mock deleting a post from Blogger
   */
  deletePost: async (postId) => {
    console.log(`ℹ️  Blogger Sync is disabled. Mocking post deletion for ID: ${postId}`);
    return { success: true };
  },

  /**
   * Mock bulk sync of pending blogs
   */
  syncAllPendingBlogs: async () => {
    // Return success with 0 synced count so cron job does not spam logs
    return { success: true, count: 0, message: "Blogger synchronization is disabled." };
  },
};
