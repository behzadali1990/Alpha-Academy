import React, { useState } from 'react';
import { Crown, Sparkles, ShieldCheck, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { FIBPaymentModal } from '../components/FIBPaymentModal';

export const PlansView: React.FC = () => {
  const { user, plans, isExpired, timeRemainingFormatted, t, language } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const isRtl = language !== 'en';

  const defaultPopularPlan = plans.find(p => p.popular || p.badge_tag) || plans[0];

  return (
    <div className={`max-w-xl mx-auto space-y-6 pb-12 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <div className="flex items-center gap-2 text-slate-700 pt-2">
        {isRtl ? <ArrowRight className="w-5 h-5 text-slate-600 cursor-pointer" /> : <ArrowLeft className="w-5 h-5 text-slate-600 cursor-pointer" />}
        <h1 className="text-lg font-extrabold text-slate-800">پلانێن بەشداریێ</h1>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center space-y-1.5 py-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          پلانەکێ هەڵبژێره
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          بەشداربە بو دەستگەهشتن ب هەمی کورسا
        </p>

        {user && !isExpired && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-800 mt-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('activeUntil')} {timeRemainingFormatted}</span>
          </div>
        )}
      </div>

      {/* Plans List - Matching Screenshot Cards */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const isBestOffer = plan.badge_tag || plan.popular;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border-2 bg-white ${
                isBestOffer
                  ? 'border-[#2B7FE0] shadow-xl ring-2 ring-[#2B7FE0]/20 bg-sky-50/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Badges Row */}
              <div className="flex items-center justify-between mb-3">
                {/* Left side: Discount badge */}
                <div>
                  {plan.discount_tag ? (
                    <span className="bg-red-500 text-white text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-2xs">
                      {plan.discount_tag}
                    </span>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Right side: Best Offer Badge */}
                <div>
                  {plan.badge_tag && (
                    <span className="bg-[#2B7FE0] text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl shadow-2xs">
                      {plan.badge_tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Card Content */}
              <div className="flex items-center justify-between pt-1">
                {/* Price (Left side in RTL) */}
                <div className="text-left">
                  {plan.formatted_original_price && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-bold block mb-0.5">
                      {plan.formatted_original_price}
                    </span>
                  )}
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {plan.formatted_price}
                  </div>
                </div>

                {/* Plan Title & Icon (Right side in RTL) */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {plan.plan_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {plan.subtitle_kurdish || `${plan.duration_months} هەیڤ`}
                    </p>
                  </div>

                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isBestOffer ? 'bg-sky-100 text-[#2B7FE0]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isBestOffer ? <Sparkles className="w-5 h-5 text-[#2B7FE0]" /> : <Crown className="w-5 h-5 text-amber-500" />}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Payment Gateway Footer - clickable to trigger FIB */}
      <div 
        onClick={() => setSelectedPlan(defaultPopularPlan)}
        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs text-center space-y-2 cursor-pointer hover:border-[#00897B] transition-colors"
      >
        <p className="text-xs font-bold text-slate-600">
          {t('paymentMethods')}
        </p>

        <div className="flex items-center justify-center pt-1">
          <div className="flex items-center gap-2.5 bg-[#00897B]/10 px-5 py-2.5 rounded-2xl text-sm font-bold text-[#00897B] border border-[#00897B]/30 hover:bg-[#00897B]/15 transition-all">
            <div className="w-6 h-6 rounded-lg bg-[#00897B] text-white flex items-center justify-center font-black text-xs">
              S
            </div>
            <span>First Iraqi Bank ( FIB )</span>
          </div>
        </div>
      </div>

      {/* FIB Payment Modal matching screenshot */}
      {selectedPlan && (
        <FIBPaymentModal
          itemType="plan"
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => setSelectedPlan(null)}
        />
      )}

    </div>
  );
};
