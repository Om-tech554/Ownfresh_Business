import React from 'react';
import { useCheckout } from './CheckoutContext';
import { Sparkles, Check, Lock, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const CommissionCoinsWidget = ({ className = "" }) => {
  const {
    membershipInfo,
    useCommissionCoins,
    setUseCommissionCoins,
    canRedeemCoins,
    commissionCoinsBalance
  } = useCheckout();

  if (!membershipInfo) return null;

  const coins = membershipInfo.commissionCoins ?? commissionCoinsBalance ?? 0;
  const isRedeemable = Boolean(membershipInfo.canRedeem ?? canRedeemCoins);
  const coinsNeeded = membershipInfo.coinsNeededToRedeem ?? Math.max(0, 150 - coins);
  const progressPct = membershipInfo.progressPercentage ?? Math.min(100, Math.floor((coins / 150) * 100));

  const handleToggle = (checked) => {
    setUseCommissionCoins(checked);
    if (checked) {
      toast.success(`Applied ${coins} Commission Coins! (Saved ₹${coins})`, {
        icon: '🪙',
        duration: 3000
      });
    } else {
      toast('Removed Commission Coins from order', { icon: 'ℹ️' });
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-amber-500/10 via-yellow-50 to-amber-100 dark:from-[#1D2530] dark:via-[#171D26] dark:to-[#111720] p-4 sm:p-5 rounded-2xl border border-amber-300/70 dark:border-[#2A3440] shadow-sm space-y-3.5 transition-colors duration-200 ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 dark:bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-[#FFD600] shrink-0">
            <Coins size={16} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black uppercase text-amber-950 dark:text-[#FFD600] tracking-wider leading-tight">
              Commission Credit Coins
            </h4>
            <p className="text-[11px] text-amber-800 dark:text-[#B7C1CE] font-medium mt-0.5">
              Balance: <strong className="text-slate-900 dark:text-[#F5F7FA] font-mono">{coins} Coins</strong> (₹{coins})
            </p>
          </div>
        </div>
        
        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-950/70 text-amber-900 dark:text-[#FFD600] border border-amber-300/50 dark:border-amber-700/50 shrink-0 whitespace-nowrap">
          45-Day Reset
        </span>
      </div>

      {/* Redemption Section: Available Checkbox vs Threshold Progress */}
      {isRedeemable ? (
        <div
          onClick={() => handleToggle(!useCommissionCoins)}
          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
            useCommissionCoins
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700/60 shadow-xs'
              : 'bg-white/90 dark:bg-[#151B23] border-amber-300/60 dark:border-[#2A3440] hover:border-amber-400'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <input
              type="checkbox"
              id="redeem-commission-coins-toggle"
              checked={useCommissionCoins}
              onChange={(e) => handleToggle(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 sm:mt-0 w-5 h-5 accent-amber-600 dark:accent-[#FFD600] cursor-pointer rounded-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F5F7FA] leading-tight">
                {useCommissionCoins ? (
                  <span className="text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center gap-1.5 flex-wrap">
                    <Check size={14} className="stroke-[3] text-emerald-600 dark:text-emerald-400" />
                    <span>Redeeming {coins} Commission Coins</span>
                    <span className="bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-black">
                      Save ₹{coins}
                    </span>
                  </span>
                ) : (
                  <span>
                    Apply {coins} Commission Coins to this order (Save ₹{coins})
                  </span>
                )}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#818C9B] mt-0.5">
                {useCommissionCoins
                  ? '₹' + coins + ' discount will be deducted from your final payable total.'
                  : 'Tap to redeem your balance directly at checkout.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/70 dark:bg-[#151B23] p-3 sm:p-3.5 rounded-xl border border-amber-200/80 dark:border-[#27313D] space-y-2">
          <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-amber-900 dark:text-[#B7C1CE]">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              <span>Redemption Threshold</span>
            </span>
            <span className="text-amber-800 dark:text-[#FFD600] font-mono font-black">
              {coins} / 150 Coins
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-amber-200/50 dark:bg-[#202832] h-2 sm:h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-[#FFD600] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[10px] sm:text-[11px] text-amber-900 dark:text-[#818C9B] leading-relaxed flex items-start gap-1.5">
            <Lock size={12} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Earn <strong>{coinsNeeded}</strong> more coins to reach the 150 coins threshold and unlock redemption at checkout!
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CommissionCoinsWidget;
