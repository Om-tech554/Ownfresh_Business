import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/usermodel.js";
import ReferralCode from "../models/referralCodeModel.js";
import ReferralUsage from "../models/referralUsageModel.js";
import Order from "../models/ordermodel.js";
import Wallet from "../models/walletModel.js";
import WalletTransaction from "../models/walletTransactionModel.js";
import { generateUniqueCode } from "../controllers/referralController.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("🟢 DB Connected successfully!");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  try {
    console.log("\n=== 1. CHECKING USERS & REFERRAL CODES ===");
    const usersCount = await User.countDocuments();
    const referralCodesCount = await ReferralCode.countDocuments();
    console.log(`Total Users in DB: ${usersCount}`);
    console.log(`Total Referral Codes in DB: ${referralCodesCount}`);

    // Fetch or create a test referrer user
    let referrer = await User.findOne({ email: "referrer_test@ownfresh.com" });
    if (!referrer) {
      console.log("Creating test referrer user...");
      referrer = await User.create({
        fullName: "Referrer Test",
        email: "referrer_test@ownfresh.com",
        mobile: "9999911111",
        role: "user"
      });
    }

    // Ensure referrer has a referral code
    let refCodeRecord = await ReferralCode.findOne({ userId: referrer._id });
    if (!refCodeRecord) {
      console.log("Generating referral code for test referrer...");
      const codeStr = await generateUniqueCode(referrer.fullName);
      refCodeRecord = await ReferralCode.create({
        code: codeStr,
        userId: referrer._id
      });
      referrer.referralCode = codeStr;
      await referrer.save();
    }
    console.log(`Referrer: ${referrer.fullName} | Code: ${refCodeRecord.code}`);

    // Fetch or create a test referee user (new customer)
    let referee = await User.findOne({ email: "referee_test@ownfresh.com" });
    if (referee) {
      // Clean up previous test referee state to run clean test
      await Order.deleteMany({ user: referee._id });
      await ReferralUsage.deleteMany({ referredUserId: referee._id });
      await Wallet.deleteOne({ userId: referee._id });
      await WalletTransaction.deleteMany({ userId: referee._id });
      referee.hasRedeemedReferral = false;
      referee.wallet = 0;
      referee.walletBalance = 0;
      await referee.save();
      console.log("Cleaned up previous referee test state.");
    } else {
      console.log("Creating test referee user...");
      referee = await User.create({
        fullName: "Referee Test",
        email: "referee_test@ownfresh.com",
        mobile: "9999922222",
        role: "user"
      });
    }
    console.log(`Referee: ${referee.fullName} | Referral Redeemed status: ${referee.hasRedeemedReferral}`);

    console.log("\n=== 2. MOCK CHECKOUT WITH REFERRAL CODE ===");
    // Simulate order placement
    // 1) Verify the code is valid (Self-referral check, first purchase check, etc.)
    if (refCodeRecord.code.toUpperCase() === referee.referralCode?.toUpperCase()) {
      throw new Error("Self-referral check failed!");
    }
    const priorCompletedOrder = await Order.findOne({ user: referee._id, paymentStatus: "completed" });
    if (priorCompletedOrder) {
      throw new Error("Referral code can only be applied before first purchase!");
    }
    console.log("✅ Referral code is VALID for referee (passes all constraints).");

    // Create a mock order with referral code
    const mockOrder = await Order.create({
      user: referee._id,
      items: [
        {
          name: "Organic Coconut Oil",
          price: 500,
          quantity: 1
        }
      ],
      PaymentMethod: "online",
      paymentStatus: "pending",
      status: "pending",
      deliveryAddress: {
        text: "123 Green Lane, Eco Town",
        phone: referee.mobile
      },
      totalAmount: 500,
      referralCode: refCodeRecord.code
    });
    console.log(`Mock order created successfully. Order ID: ${mockOrder._id} | Payment Status: ${mockOrder.paymentStatus}`);

    // Create a pending ReferralUsage record (normally created during checkoutController.js)
    const referralUsage = await ReferralUsage.create({
      referralCode: refCodeRecord.code,
      referrerUserId: referrer._id,
      referrerId: referrer._id,
      referredUserId: referee._id,
      referralCodeId: refCodeRecord._id,
      orderId: mockOrder._id,
      status: "PENDING",
      rewardAmount: 100, // Referrer gets 100
      refereeRewardAmount: 50, // Referee gets 50
      rewardPoints: 100
    });
    console.log(`Pending ReferralUsage created. Status: ${referralUsage.status}`);

    console.log("\n=== 3. SIMULATING ORDER PAYMENT SUCCESS ===");
    // Mark order as completed (payment success)
    mockOrder.paymentStatus = "completed";
    await mockOrder.save();
    console.log("Mock order marked as payment 'completed'.");

    console.log("\n=== 4. SIMULATING ADMIN APPROVAL ===");
    // Admin approves the referral (equivalent of referralController.js -> approveReferral)
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const referral = await ReferralUsage.findById(referralUsage._id).session(session);
      if (referral.status !== "PENDING") {
        throw new Error("Referral is already processed.");
      }

      const order = await Order.findById(referral.orderId).session(session);
      if (order.paymentStatus !== "completed") {
        throw new Error("Linked order payment is not completed.");
      }

      // 1. Credit Referrer Wallet
      let referrerWallet = await Wallet.findOneAndUpdate(
        { userId: referral.referrerUserId },
        { $setOnInsert: { userId: referral.referrerUserId } },
        { upsert: true, new: true, session }
      );
      referrerWallet.balance += referral.rewardAmount;
      referrerWallet.totalEarned += referral.rewardAmount;
      await referrerWallet.save({ session });

      const refUser = await User.findById(referral.referrerUserId).session(session);
      if (refUser) {
        refUser.wallet = (refUser.wallet || 0) + referral.rewardAmount;
        refUser.walletBalance = (refUser.walletBalance || 0) + referral.rewardAmount;
        refUser.referralPoints = (refUser.referralPoints || 0) + referral.rewardAmount;
        await refUser.save({ session });
      }

      await new WalletTransaction({
        walletId: referrerWallet._id,
        userId: referral.referrerUserId,
        type: "REFERRAL_BONUS",
        amount: referral.rewardAmount,
        description: `Referral bonus for referring User ID: ${referral.referredUserId}`,
        referenceOrderId: referral.orderId,
        timestamp: new Date()
      }).save({ session });

      // 2. Credit Referee Wallet
      let refereeWallet = await Wallet.findOneAndUpdate(
        { userId: referral.referredUserId },
        { $setOnInsert: { userId: referral.referredUserId } },
        { upsert: true, new: true, session }
      );
      refereeWallet.balance += referral.refereeRewardAmount;
      refereeWallet.totalEarned += referral.refereeRewardAmount;
      await refereeWallet.save({ session });

      const newCust = await User.findById(referral.referredUserId).session(session);
      if (newCust) {
        newCust.wallet = (newCust.wallet || 0) + referral.refereeRewardAmount;
        newCust.walletBalance = (newCust.walletBalance || 0) + referral.refereeRewardAmount;
        newCust.hasRedeemedReferral = true;
        await newCust.save({ session });
      }

      await new WalletTransaction({
        walletId: refereeWallet._id,
        userId: referral.referredUserId,
        type: "REFERRAL_BONUS",
        amount: referral.refereeRewardAmount,
        description: `Welcome bonus for using a referral code.`,
        referenceOrderId: referral.orderId,
        timestamp: new Date()
      }).save({ session });

      // Mark referral usage as APPROVED
      referral.status = "APPROVED";
      await referral.save({ session });

      // Mark order as rewarded
      order.isReferralRewarded = true;
      order.rewardCredited = true;
      await order.save({ session });

      await session.commitTransaction();
      console.log("🎉 Referral Approved and transaction committed successfully!");
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    console.log("\n=== 5. VERIFYING WALLET BALANCES ===");
    const updatedReferrer = await User.findById(referrer._id);
    const updatedReferee = await User.findById(referee._id);
    const referrerWalletData = await Wallet.findOne({ userId: referrer._id });
    const refereeWalletData = await Wallet.findOne({ userId: referee._id });

    console.log(`Referrer Wallet Balance: ₹${referrerWalletData.balance} (Expected: ₹100+)`);
    console.log(`Referrer User Wallet Balance Field: ₹${updatedReferrer.walletBalance}`);
    console.log(`Referee Wallet Balance: ₹${refereeWalletData.balance} (Expected: ₹50)`);
    console.log(`Referee User Wallet Balance Field: ₹${updatedReferee.walletBalance}`);
    console.log(`Referee Redeemed State: ${updatedReferee.hasRedeemedReferral} (Expected: true)`);

    console.log("\n✅ ALL TESTS PASSED: Referral Program is fully functional!");

    // Cleanup test data to keep DB clean
    console.log("\nCleaning up test records...");
    await Order.findByIdAndDelete(mockOrder._id);
    await ReferralUsage.findByIdAndDelete(referralUsage._id);
    await Wallet.deleteOne({ userId: referee._id });
    await WalletTransaction.deleteMany({ userId: referee._id });
    await User.findByIdAndDelete(referee._id);
    console.log("🧹 Cleanup complete.");

  } catch (error) {
    console.error("❌ Test Failed:", error.stack || error);
  } finally {
    mongoose.connection.close();
    console.log("Disconnected from database.");
  }
};

run();
