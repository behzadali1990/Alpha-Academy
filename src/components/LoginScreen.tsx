import React, { useState } from 'react';
import { Snowflake, Mail, Lock, Eye, EyeOff, Calendar, ChevronDown, Check, AlertCircle, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [regStep, setRegStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [city, setCity] = useState<string>('دهۆک');
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [gender, setGender] = useState<string>('male');

  // Login credentials
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const citiesList = [
    'دهۆک',
    'زاخۆ',
    'هەولێر',
    'سلێمانی',
    'ئاکرێ',
    'ئامێدی',
    'بەردەڕەش',
    'شێخان',
    'کەرکووک',
    'هەڵەبجە',
    'باژێرەکێ دی'
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('تکایە ئیمێلێ خۆ بنڤێسە');
      return;
    }

    if (!password) {
      setErrorMessage('تکایە پەیڤا دەربازبوونێ بنڤێسە');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        setSuccessMessage('چوونا ژوور ب سەرکەفتن هاتە ئەنجامدان!');
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.error || 'ئیمێل یان پەیڤا دەربازبوونێ شاشە');
      }
    } catch (err: any) {
      setErrorMessage('ئاریشەک پەیدابوو د پەیوەندیا سێرڤەری دا');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regStep === 1) {
      if (!fullName.trim()) {
        setErrorMessage('هیڤیە ناڤێ خۆ یێ سیانی بنڤێسە');
        return;
      }
      setRegStep(2);
      return;
    }

    if (!email.trim()) {
      setErrorMessage('هیڤیە ئیمێلێ خۆ بنڤێسە');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('شێوازێ ئیمێلی دروست نینە (نموونە: student@example.com)');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('پەیڤا دەربازبوونێ پێدڤیە کێمتر نەبیت ژ ٦ پیتان');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        birthdate,
        city,
        gender,
        is_student: isStudent
      });

      if (result.success) {
        setSuccessMessage('هەژمار ب سەرکەفتن هاتە دروستکرن!');
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.error || 'خەلەتیەک د تۆماربوونێ دا رویدا');
      }
    } catch (err: any) {
      setErrorMessage('ئاریشەک پەیدابوو د پەیوەندیا سێرڤەری دا');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail.trim()) {
      setErrorMessage('تکایە ئیمەیلا خۆ بنڤێسە!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setForgotSent(true);
      } else {
        setErrorMessage(data.error || 'ئاریشەک پەیدابوو');
      }
    } catch (err) {
      setErrorMessage('ئاریشەک پەیدابوو د پەیوەندیا سێرڤەری دا');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for testing verified accounts through real POST /api/auth/login
  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 relative font-sans text-slate-800 dir-rtl" 
      dir="rtl"
    >
      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        
        {/* App Logo & Name */}
        <div className="flex items-center justify-center gap-2.5 mt-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#2B7FE0] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Snowflake className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              ئەکادیمیایا ئەلفا
            </h2>
            <p className="text-[10px] text-sky-600 font-bold">سیستەمێ فێرکاریێ باوەرپێکری</p>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 font-bold animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1 mb-4 text-right">
                <h1 className="text-2xl font-black text-slate-900">
                  چوونا ژوور
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
                  بخێرهاتیەڤە! ئیمێل و پەیڤا دەربازبوونێ بنڤێسە ژ بۆ دەستپێکرنا خواندنێ.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    ئیمێل
                  </label>
                  <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] focus-within:ring-2 focus-within:ring-[#2B7FE0]/20 transition-all">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ئیمێلێ خۆ بنڤێسە"
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-semibold text-right pr-2 pl-8"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    پەیڤا دەربازبوونێ
                  </label>
                  <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] focus-within:ring-2 focus-within:ring-[#2B7FE0]/20 transition-all">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="پەیڤا دەربازبوونێ بنڤێسە"
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-semibold text-right pr-2 pl-8"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors absolute left-3.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="text-left pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-xs font-bold text-[#2B7FE0] hover:underline cursor-pointer"
                  >
                    تە پەیڤا دەربازبوونێ ژبیر کریە؟
                  </button>
                </div>
              </div>

              {/* Quick Preset Accounts (for testing verified auth) */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>هەژمارێن نموونەیی بۆ تاقیکردنێ:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => fillCredentials('student@alpha.edu', 'student123')}
                    className="p-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/60 rounded-xl font-bold transition-all text-center"
                  >
                    قوتابی
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('behzad@alpha.edu', 'behzad123')}
                    className="p-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/60 rounded-xl font-bold transition-all text-center"
                  >
                    م. بهزاد
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@alpha.edu', 'admin123')}
                    className="p-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/60 rounded-xl font-bold transition-all text-center"
                  >
                    بەڕێوەبەر
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2B7FE0] hover:bg-[#1E5BB0] disabled:bg-slate-300 text-white font-extrabold py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>پشکنینا پێزانینان...</span>
                  </>
                ) : (
                  <span>چوونا ژوور</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegStep(1);
                  setErrorMessage('');
                }}
                className="w-full bg-white border-2 border-[#2B7FE0] text-[#2B7FE0] hover:bg-blue-50/50 font-extrabold py-3.5 rounded-2xl transition-all text-sm cursor-pointer"
              >
                خۆ تۆمار بکه
              </button>
            </div>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex-1 flex flex-col justify-between space-y-4">
            {regStep === 1 ? (
              <>
                <div className="space-y-1 mb-2 text-right">
                  <h1 className="text-xl font-black text-slate-900">
                    دروستکرنا هەژمارێ
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    قۆناغا ١ ژ ٢: پێزانینێن خۆ یێن سەرەکی بنڤێسە
                  </p>
                </div>

                {/* Field 1: Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    ناڤێ سیانی
                  </label>
                  <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] transition-all">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ناڤێ سیانی بنڤێسە"
                      className="w-full bg-transparent outline-none text-slate-900 text-xs font-semibold text-right"
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Birthdate */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    بەروارێ ژ دایکبوونێ
                  </label>
                  <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] transition-all">
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-900 text-xs font-semibold text-right"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 mr-2 pointer-events-none" />
                  </div>
                </div>

                {/* Field 3: Gender */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    ڕەگەز
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-2xl border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        gender === 'male' ? 'bg-white text-[#2B7FE0] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      نێر
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        gender === 'female' ? 'bg-white text-[#2B7FE0] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      مێ
                    </button>
                  </div>
                </div>

                {/* Field 4: Are you a student? */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    تو قوتابی؟
                  </label>
                  <div className="bg-[#F1F5F9] p-1 rounded-2xl flex items-center justify-between gap-1 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setIsStudent(true)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isStudent ? 'bg-[#2B7FE0] text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      بەلێ
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStudent(false)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        !isStudent ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      نەخێر
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-[#2B7FE0] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-xs cursor-pointer"
                  >
                    بەردەوامبوون بۆ هەنگاوا دوویێ
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    زڤڕین بۆ چوونا ژوور
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1 mb-2 text-right">
                  <h1 className="text-xl font-black text-slate-900">
                    پاراستنا هەژمارێ
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    قۆناغا ٢ ژ ٢: باژێر، ئیمێل و پەیڤا نهێنی بنڤێسە
                  </p>
                </div>

                {/* City Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    باژێر
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none appearance-none focus:bg-white focus:border-[#2B7FE0] text-right"
                    >
                      {citiesList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute top-4 left-4 pointer-events-none" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    ئیمێل
                  </label>
                  <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] transition-all">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full bg-transparent outline-none text-slate-900 text-xs font-semibold text-right"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 mr-2 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    پەیڤا دەربازبوونێ (نهێنی)
                  </label>
                  <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] transition-all">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="کێمتر نەبیت ژ ٦ پیتان"
                      className="w-full bg-transparent outline-none text-slate-900 text-xs font-semibold text-right"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 mr-2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2B7FE0] hover:bg-[#1E5BB0] disabled:bg-slate-300 text-white font-extrabold py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>دروستکرنا هەژمارێ...</span>
                      </>
                    ) : (
                      <span>تۆماربوونا سەرکەفتی</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    زڤڕین بۆ هەنگاوا بەرێ
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="space-y-1 mb-4 text-right">
                <h1 className="text-xl font-black text-slate-900">
                  ژبیرکرنا پەیڤا نهێنی
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  ئیمەیلا خۆ بنڤێسە ژ بۆ هندێ لینکا نووکرنێ بۆ تە بهێتە فرێکرن.
                </p>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 text-right">
                      ئیمێل
                    </label>
                    <div className="relative flex items-center bg-[#F1F5F9]/80 border border-slate-200/70 rounded-2xl px-4 py-3.5 focus-within:bg-white focus-within:border-[#2B7FE0] transition-all">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-transparent outline-none text-slate-900 text-xs font-semibold text-right"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-400 mr-2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2B7FE0] hover:bg-blue-600 disabled:bg-slate-300 text-white font-extrabold py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>هنارتن...</span>
                      </>
                    ) : (
                      <span>هنارتنا لینکێ نووکرنێ</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-800">
                    لینک هاتە هنارتن!
                  </h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    ئەگەر هەژمار هەبیت، لینکا نووکرنا پەیڤا نهێنی بۆ ئیمەیلا تە هاتە هنارتن.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setForgotSent(false);
                setErrorMessage('');
              }}
              className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
            >
              زڤڕین بۆ چوونا ژوور
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
