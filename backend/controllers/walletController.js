import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";

// Fetch user's wallet details and transaction logs
export const getMyWallet = async (req, res) => {
  try {
    const userId = req.userId;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0
      });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // limit to 50 recent transactions

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalRedeemed: wallet.totalRedeemed,
      transactions
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    res.status(500).json({ message: "Error fetching wallet data" });
  }
};
