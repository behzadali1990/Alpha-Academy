import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  ShieldCheck,
  Building2,
  CheckCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tag,
  Gift,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Course, SubscriptionPlan } from '../types';

interface FIBPaymentModalProps {
  itemType: 'course' | 'plan';
  course?: Course | null;
  plan?: SubscriptionPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}

async function safeJson<T = any>(res: Response): Promise<T> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return {} as T;
    return JSON.parse(text) as T;
  } catch (err) {
    return {} as T;
  }
}

export const FIBPaymentModal: React.FC<FIBPaymentModalProps> = ({
  itemType,
  course,
  plan,
  onClose,
  onSuccess
}) => {
  const { token, setUser, fibSettings } = useAuth();

  // Timer countdown: 10 minutes (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false);
  const [isCopiedAccount, setIsCopiedAccount] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [openStatusNotice, setOpenStatusNotice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Promo Code State (Server-Authoritative)
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_type: 'PERCENT' | 'FIXED';
    discount_value: number;
    discount_amount: number;
    final_price: number;
    is_free: boolean;
    description?: string;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string>('');

  // Transaction state created and verified on server
  const [refCode, setRefCode] = useState<string>('ALPHA-INIT');
  const [paymentId, setPaymentId] = useState<string>('');
  const [deepLinkUrl, setDeepLinkUrl] = useState<string>('');

  // FIB Merchant Account Details
  const fibAccountNumber = fibSettings?.account_number || '0750 426 0155';

  // Calculate pricing & titles
  const title = itemType === 'course' 
    ? (course?.title || 'Biology - Grade 12')
    : (plan?.plan_name || 'پلانا ئەکادیمی');

  const basePrice = itemType === 'course'
    ? (course?.price || 60000)
    : (plan?.price || 60000);

  // Active current price (discounted by server if promo applied)
  const currentPayablePrice = appliedPromo ? appliedPromo.final_price : basePrice;

  // Initialize/re-initialize official payment on Alpha Academy Backend
  const initPaymentSession = useCallback(async (amount: number) => {
    setIsInitializing(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/fib/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_type: itemType,
          target_id: itemType === 'course' ? (course?.id || 'course_default') : (plan?.id || 'monthly'),
          item_title: title,
          amount_iqd: amount,
          duration_months: plan?.duration_months || 1
        })
      });

      const data = await safeJson(res);
      if (data.success && data.payment) {
        setRefCode(data.payment.ref_code);
        setPaymentId(data.payment.payment_id);
        setDeepLinkUrl(data.deepLink || `fib://transfer?account=${(data.payment.fib_account || fibAccountNumber).replace(/\s/g, '')}&amount=${amount}&ref=${data.payment.ref_code}`);
      } else {
        setErrorMessage(data.error || 'دەستپێکرنا پارەدانا FIB ل سەر سێرڤەری سەرنەکەفت');
      }
    } catch (err: any) {
      console.error('Failed to create payment session:', err);
      setErrorMessage('ئاریشەک د پەیوەندیا سێرڤەری دا پەیدابوو');
    } finally {
      setIsInitializing(false);
    }
  }, [itemType, course?.id, plan?.id, token, title, fibAccountNumber, plan?.duration_months]);

  useEffect(() => {
    initPaymentSession(basePrice);
  }, [initPaymentSession, basePrice]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(fibAccountNumber.replace(/\s/g, ''));
    setIsCopiedAccount(true);
    setTimeout(() => setIsCopiedAccount(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2500);
  };

  // -------------------------------------------------------------
  // Server-authoritative Promo Code Validation
  // -------------------------------------------------------------
  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    setPromoError('');
    setPromoSuccessMsg('');

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoInput.trim(),
          original_price: basePrice,
          item_type: itemType
        })
      });

      const data = await safeJson(res);

      if (!res.ok || !data.valid) {
        setPromoError(data.error || 'کۆدێ داشکاندنێ نەدروستە یان بەسەرچوویە');
        setAppliedPromo(null);
        setIsValidatingPromo(false);
        return;
      }

      setAppliedPromo({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount: data.discount_amount,
        final_price: data.final_price,
        is_free: data.is_free,
        description: data.description
      });

      setPromoSuccessMsg(data.message || 'کۆد هاتە پەسەندکرن!');

      // If price > 0, re-initialize FIB payment with new discounted amount on server
      if (data.final_price > 0) {
        initPaymentSession(data.final_price);
      }
    } catch (err: any) {
      console.error('Validate promo error:', err);
      setPromoError('ئاریشەک د پەیوەندیا سێرڤەری دا پەیدابوو');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
    setPromoSuccessMsg('');
    initPaymentSession(basePrice);
  };

  const handleOpenFIBApp = () => {
    navigator.clipboard.writeText(fibAccountNumber.replace(/\s/g, ''));
    setIsCopiedAccount(true);
    setOpenStatusNotice(`هەژمارا FIB (${fibAccountNumber}) و کۆدێ (${refCode}) هاتە کۆپیکرن، ئەپ دهێتە ڤەکرن...`);

    const targetLink = deepLinkUrl || `fib://transfer?account=${fibAccountNumber.replace(/\s/g, '')}&amount=${currentPayablePrice}&ref=${refCode}`;
    window.location.href = targetLink;

    setTimeout(() => {
      window.open(`https://fib.iq/`, '_blank');
    }, 800);

    setTimeout(() => {
      setOpenStatusNotice('');
      setIsCopiedAccount(false);
    }, 4500);
  };

  // -------------------------------------------------------------
  // Free 100% Promo Redemption on Server
  // -------------------------------------------------------------
  const handleRedeemFreePromo = async () => {
    if (!appliedPromo || !appliedPromo.is_free) return;
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/promo/redeem-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: appliedPromo.code,
          item_type: itemType,
          target_id: itemType === 'course' ? (course?.id || 'course_default') : (plan?.id || 'monthly'),
          duration_months: plan?.duration_months || 1
        })
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        setIsVerifying(false);
        setErrorMessage(data.error || 'سێرڤەری کۆد پەسەند نەکرد');
        return;
      }

      if (data.user && typeof setUser === 'function') {
        setUser(data.user);
      }

      setIsVerifying(false);
      setIsSuccess(true);

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onSuccess();
      }, 2200);
    } catch (err: any) {
      console.error('Free redeem error:', err);
      setIsVerifying(false);
      setErrorMessage('خەلەتیەک د پەیوەندیا سێرڤەری دا رویدا');
    }
  };

  // -------------------------------------------------------------
  // FIB Settle Verification Flow on Server
  // -------------------------------------------------------------
  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/fib/verify-and-settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ref_code: refCode,
          payment_id: paymentId,
          transaction_id: `TXN-FIB-${Date.now()}`
        })
      });

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        setIsVerifying(false);
        setErrorMessage(data.error || 'سێرڤەری پارەدان پشتڕاست نەکرد. تکایە پشتڕاست بە کو کۆد و کۆژم دروستن.');
        return;
      }

      if (data.user && typeof setUser === 'function') {
        setUser(data.user);
      }

      setIsVerifying(false);
      setIsSuccess(true);

      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onSuccess();
      }, 2200);
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setIsVerifying(false);
      setErrorMessage('خەلەتیەک د پەیوەندیا سێرڤەری دا رویدا. تکایە دووبارە پشکنین بکە.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200" id="fib_payment_modal">
      
      {/* Container */}
      <div className="w-full max-w-[440px] bg-slate-100 sm:rounded-[36px] rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] border border-slate-200/60">
        
        {/* Top Header Navigation */}
        <div className="pt-4 pb-2 px-5 bg-slate-100 flex items-center justify-between relative">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-700 shadow-sm transition-transform active:scale-95 cursor-pointer"
            id="close_fib_modal_btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1 pr-9">
            <h2 className="text-base font-bold text-slate-900">
              {itemType === 'course' ? 'کڕینا کۆرسی' : 'بەشداربوونا پلانی'}
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[240px] mx-auto">
              {title}
            </p>
          </div>
        </div>

        {/* Main Sheet Card */}
        <div className="bg-[#FAF6F6] rounded-t-[28px] sm:rounded-b-[32px] p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 shadow-inner text-right" dir="rtl">
          
          {/* Top Handle Pill */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

          {isInitializing ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#00897B] animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                دروستکرنا مامەڵەیا پارەدانا فەرمی ل سەر سێرڤەری...
              </p>
            </div>
          ) : !isSuccess ? (
            <>
              {/* FIB Brand Row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00897B] text-white flex items-center justify-center font-black shadow-md shadow-[#00897B]/20 shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M7 4h10a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1H9a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1h10a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    بانکا ئێکێ یا عیراقی ( FIB )
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    First Iraqi Bank Direct Gateway
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold leading-relaxed animate-in fade-in flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Status Notice when FIB opening is triggered */}
              {openStatusNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{openStatusNotice}</span>
                </div>
              )}

              {/* SERVER-VALIDATED PROMO CODE ACCORDION */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#00897B]" />
                    <span>کۆدێ داشکاندنێ (Promo Code)</span>
                  </div>
                  {appliedPromo && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {appliedPromo.discount_type === 'PERCENT' ? `${appliedPromo.discount_value}٪ داشکاندن` : `${appliedPromo.discount_value.toLocaleString()} IQD داشکاندن`}
                    </span>
                  )}
                </div>

                {!appliedPromo ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="کۆدێ داشکاندنێ بنڤێسە..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#00897B] text-slate-800"
                      id="promo_code_input"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingPromo || !promoInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      id="apply_promo_btn"
                    >
                      {isValidatingPromo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>جێبەجێکرن</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-mono font-black">{appliedPromo.code}</span>
                        <span className="text-[11px] block text-emerald-700 font-medium">
                          {appliedPromo.description || 'داشکاندنا تایبەت ل سەر سێرڤەری هاتە تۆمارکرن'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="لادانا کۆدی"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {promoSuccessMsg && (
                  <p className="text-[11px] text-emerald-700 font-bold">{promoSuccessMsg}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 font-bold">{promoError}</p>
                )}
              </div>

              {/* FIB OFFICIAL ACCOUNT CARD */}
              {!appliedPromo?.is_free && (
                <div className="bg-gradient-to-br from-[#00897B] to-[#005f56] text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-teal-100 font-bold">
                      <Building2 className="w-4 h-4 text-teal-200" />
                      <span>هەژمارا فەرمی یا FIB</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                      Official Merchant
                    </span>
                  </div>

                  {/* Account Number Display */}
                  <div className="flex items-center justify-between bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10" dir="ltr">
                    <div>
                      <span className="text-[10px] text-teal-200 block uppercase font-mono tracking-wider">FIB Account / Phone</span>
                      <span className="text-base sm:text-lg font-black tracking-wider text-white font-mono">
                        {fibAccountNumber}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyAccount}
                      className="px-3 py-1.5 rounded-lg bg-white text-[#00897B] font-bold text-xs hover:bg-teal-50 transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                    >
                      {isCopiedAccount ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>هاتە کۆپیکرن</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کۆپی</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Total Payment & Time Remaining Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
                {/* Total Payment */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>کۆژمێ پارەدانی</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {currentPayablePrice === 0 ? 'بێبەرامبەر (0 IQD)' : `${currentPayablePrice.toLocaleString()} IQD`}
                    </span>
                    {appliedPromo && (
                      <span className="text-xs text-slate-400 line-through">
                        {basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>دەمێ مای</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                    {formatTimer(timeLeft)}
                  </div>
                </div>
              </div>

              {/* QR Code & Reference Container (shown when price > 0) */}
              {!appliedPromo?.is_free && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col items-center space-y-3">
                  
                  {/* High Fidelity Teal QR Code */}
                  <div className="relative p-2.5 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <svg className="w-36 h-36 sm:w-40 sm:h-40" viewBox="0 0 200 200" fill="none">
                      <rect x="10" y="10" width="50" height="50" rx="10" stroke="#00897B" strokeWidth="10" />
                      <rect x="25" y="25" width="20" height="20" rx="4" fill="#00897B" />
                      
                      <rect x="140" y="10" width="50" height="50" rx="10" stroke="#00897B" strokeWidth="10" />
                      <rect x="155" y="25" width="20" height="20" rx="4" fill="#00897B" />
                      
                      <rect x="10" y="140" width="50" height="50" rx="10" stroke="#00897B" strokeWidth="10" />
                      <rect x="25" y="155" width="20" height="20" rx="4" fill="#00897B" />

                      <g fill="#00897B">
                        <rect x="70" y="15" width="10" height="10" rx="2" />
                        <rect x="90" y="15" width="20" height="10" rx="2" />
                        <rect x="120" y="15" width="10" height="10" rx="2" />
                        <rect x="70" y="35" width="20" height="10" rx="2" />
                        <rect x="100" y="35" width="10" height="10" rx="2" />
                        <rect x="120" y="35" width="10" height="20" rx="2" />

                        <rect x="15" y="70" width="10" height="20" rx="2" />
                        <rect x="35" y="70" width="20" height="10" rx="2" />
                        <rect x="15" y="100" width="20" height="10" rx="2" />
                        <rect x="45" y="90" width="10" height="20" rx="2" />
                        
                        <rect x="145" y="70" width="20" height="10" rx="2" />
                        <rect x="175" y="70" width="10" height="20" rx="2" />
                        <rect x="145" y="90" width="10" height="20" rx="2" />
                        <rect x="165" y="100" width="20" height="10" rx="2" />

                        <rect x="70" y="145" width="10" height="20" rx="2" />
                        <rect x="90" y="145" width="20" height="10" rx="2" />
                        <rect x="120" y="145" width="10" height="10" rx="2" />
                        <rect x="70" y="175" width="20" height="10" rx="2" />
                        <rect x="100" y="165" width="20" height="10" rx="2" />
                        <rect x="130" y="165" width="20" height="20" rx="2" />
                        <rect x="160" y="145" width="10" height="20" rx="2" />
                        <rect x="175" y="175" width="15" height="10" rx="2" />
                      </g>

                      <rect x="76" y="76" width="48" height="48" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                      <rect x="82" y="82" width="36" height="36" rx="8" fill="#00897B" />
                      <path 
                         d="M93 89h14a1.5 1.5 0 0 1 1.5 1.5v1.5a1 1 0 0 1-1 1H95a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h12a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H92a1.5 1.5 0 0 1-1.5-1.5v-1.5a1 1 0 0 1 1-1h12a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H93a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 93 89z" 
                        fill="white" 
                      />
                    </svg>
                  </div>

                  {/* Reference Code & Copy Row */}
                  <div className="w-full flex items-center justify-between pt-1 px-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100" dir="ltr">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">PAYMENT REF CODE</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 tracking-wider">
                        {refCode}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      {isCopiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">هاتە کۆپیکرن</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>کۆپی</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {appliedPromo?.is_free ? (
                  /* 100% Free Promo direct server unlock button */
                  <button
                    onClick={handleRedeemFreePromo}
                    disabled={isVerifying}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
                    id="redeem_free_promo_btn"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>چالاککرن ل سەر سێرڤەری...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>چالاکرنا بەخشینێ (١٠٠٪ بێبەرامبەر)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    {/* 1. Open FIB App Button */}
                    <button
                      onClick={handleOpenFIBApp}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#00897B] hover:bg-[#00796B] text-white font-bold text-sm shadow-md shadow-[#00897B]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      id="open_fib_app_btn"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>ڤەکرنا ئەپا FIB ({currentPayablePrice.toLocaleString()} IQD)</span>
                    </button>

                    {/* 2. Verify Payment Button (Server-Authoritative) */}
                    <button
                      onClick={handleVerifyPayment}
                      disabled={isVerifying || isInitializing}
                      className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
                      id="verify_fib_payment_btn"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 text-[#00897B] animate-spin" />
                          <span>پشکنینا مامەڵەیێ ل سێرڤەری...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 text-teal-600" />
                          <span>پشتڕاستکرنا وەرگرتنا پارەی ل سێرڤەری</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Secure Trust notice */}
              <div className="text-center pt-1">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>داشکاندن و پارەدان ب تەمامی ژ لایێ سێرڤەری ڤە دهێنە چاودێریکرن</span>
                </p>
              </div>

            </>
          ) : (
            /* Successful Payment View */
            <div className="py-8 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  {itemType === 'course' ? 'کۆرس ب سەرکەفتن هاتە کڕین!' : 'بەشداربوون ب سەرکەفتن هاتە چالاکرن!'}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  سوپاس بۆ پارەدانا تە. داتایێن پەسەندکرنێ ل سەر سێرڤەری هاتنە تۆمارکرن و هەمی وانە بۆ تە بەردەست بوون.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 font-bold" dir="ltr">
                ✓ سێرڤەر: مامەڵە ل داتابەیسێ هاتە پشتڕاستکرن
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
