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

    // Job: Auto-Sync Pending Online PhonePe Orders
    // Schedule: Runs every 10 minutes to verify if pending orders were paid on PhonePe
    cron.schedule('*/10 * * * *', async () => {
        try {
            const Order = (await import('../models/ordermodel.js')).default;
            const { queryPhonePeOrderStatus, completeOrderPayment } = await import('../controllers/paymentController.js');
            const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
            const pendingOrders = await Order.find({
                PaymentMethod: "online",
                paymentStatus: "pending",
                createdAt: { $gte: fortyEightHoursAgo }
            }).limit(10).populate("user", "fullName email mobile");

            if (pendingOrders && pendingOrders.length > 0) {
                console.log(`🔍 [PhonePe Auto-Sync Cron] Checking ${pendingOrders.length} pending online order(s)...`);
                for (const pOrder of pendingOrders) {
                    try {
                        const check = await queryPhonePeOrderStatus(pOrder._id.toString());
                        if (check && check.isCompleted) {
                            await completeOrderPayment(pOrder, {
                                txnId: check.txnId,
                                phonePeOrderId: check.phonePeOrderId,
                                utr: check.utr,
                                merchantOrderId: pOrder._id.toString()
                            });
                            console.log(`✅ [PhonePe Auto-Sync] Order ${pOrder.customOrderId || pOrder._id} verified & marked COMPLETED!`);
                        }
                    } catch (pErr) {
                        console.error(`[PhonePe Auto-Sync] Error checking order ${pOrder._id}:`, pErr.message);
                    }
                }
            }
        } catch (cronErr) {
            console.error("❌ Background Job (PhonePe Order Sync) Error:", cronErr.message);
        }
    });

    // Optional: One-time sync on server start (with a delay to ensure DB connection is ready)
    setTimeout(async () => {
        console.log("🚀 Server Start Sync: Checking for pending blogs...");
        await bloggerService.syncAllPendingBlogs();
    }, 10000); // 10s delay
};
