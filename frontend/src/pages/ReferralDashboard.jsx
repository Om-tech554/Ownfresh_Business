import React from "react";
import { useSelector } from "react-redux";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Coins
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const ReferralDashboard = () => {
  const user = useSelector((state) => state.user.userData);
  
  const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode}`;

  const copyToClipboard = (text) => {
    if (!text || text.includes("undefined")) {
      return toast.error("Referral code not available yet. Please refresh.");
    }
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareOnWhatsApp = () => {
    const message = `Check out OwnFresh! Use my referral code ${user?.referralCode} to get ₹50 off on your first order of fresh wood-pressed oils. Download now: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-28 pb-20 px-6">
        {/* HEADER CARD */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9DD19] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center gap-4">
              Refer & <span className="text-[#F9DD19]">Earn</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Share the goodness of wood-pressed oils with your friends and get rewarded for every successful referral.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <Coins className="text-[#F9DD19]" size={32} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Your Balance</p>
                  <p className="text-3xl font-black">₹{user?.rewardPoints || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* STEP CARD */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
              <TrendingUp size={20} className="text-[#1E971D]" /> How it works
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-800">Share your code</p>
                  <p className="text-slate-500 text-sm">Send your unique code via WhatsApp or Social Media.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-800">Friend signs up</p>
                  <p className="text-slate-500 text-sm">They get <span className="text-[#1E971D] font-bold">₹50</span> instantly on using your code.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-800">Get Rewarded</p>
                  <p className="text-slate-500 text-sm">Get <span className="text-[#1E971D] font-bold">₹100</span> in your wallet after their first order.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SHARE CARD */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <h2 className="text-xl font-black mb-6 text-slate-800">Your Referral Code</h2>
            
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 w-full rounded-2xl p-6 mb-6 group hover:border-[#F9DD19] transition-colors cursor-pointer" onClick={() => copyToClipboard(user?.referralCode)}>
              <span className="text-4xl font-black tracking-[0.5em] text-slate-900 group-hover:text-[#1E971D] transition-colors">
                {user?.referralCode || "LOADING..."}
              </span>
              <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                <Copy size={12} /> Tap to copy code
              </p>
            </div>

            <button 
              onClick={shareOnWhatsApp}
              className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#25D366]/20"
            >
              <Share2 size={20} /> Share on WhatsApp
            </button>
            
            <button 
              onClick={() => copyToClipboard(referralLink)}
              className="w-full mt-3 bg-slate-100 text-slate-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
            >
              <Copy size={20} /> Copy Link
            </button>
          </div>
        </div>

        {/* REWARDS STATS */}
        <div className="mt-8 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Gift size={20} className="text-[#F9DD19]" /> Referral History
            </h2>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Verified Rewards Only</div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 overflow-hidden">
             {user?.referralHistory?.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {user.referralHistory.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold uppercase">
                         {item.userName?.slice(0, 1)}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800">{item.userName}</p>
                         <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()} • Success</p>
                       </div>
                     </div>
                     <div className="text-[#1E971D] font-black text-lg">
                       + ₹{item.rewardAmount}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-12">
                 <Users className="mx-auto text-slate-200 mb-4" size={48} />
                 <p className="text-slate-400 font-bold italic">Start referring friends to see your history here!</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
