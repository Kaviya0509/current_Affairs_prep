"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[140px] -ml-64 -mt-64" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -mr-48 -mb-48" />

      <div className="w-full max-w-[480px] relative z-10 animate-fade-up">
        {/* Registration Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 md:p-14 shadow-2xl shadow-slate-200/50">
          {/* Back Link */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-slate-900 transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            BACK TO LOGIN
          </Link>

          {/* Header */}
          <div className="mb-10 text-center">
             <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
                <ShieldCheck size={28} />
             </div>
             <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-3">
               Start Your Career Intelligence <br /> Intelligence Feed.
             </h1>
             <p className="text-[14px] text-slate-500 font-medium">
               Create your professional personnel profile.
             </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Personnel Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="EX: VENKATESH M"
                  className="w-full h-[58px] pl-14 pr-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-[14px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="venkatesh@service.ia"
                  className="w-full h-[58px] pl-14 pr-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-[14px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Security Code</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="MIN. 8 CHARACTERS"
                  className="w-full h-[58px] pl-14 pr-16 rounded-2xl bg-slate-50/50 border border-slate-100 text-[14px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 focus:bg-white transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pl-1">
              <button 
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-all ${agreed ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-transparent"}`}
              >
                 <CheckCircle2 size={14} />
              </button>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                I agree to the <span className="text-slate-900 font-bold hover:underline cursor-pointer">Codes of Conduct</span> and <span className="text-slate-900 font-bold hover:underline cursor-pointer">Intelligence Protocols</span>.
              </p>
            </div>

            {/* Submit */}
            <button className="w-full h-[64px] bg-slate-900 text-white rounded-2xl font-bold text-[16px] shadow-2xl shadow-slate-300 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-4">
              Authorize Personnel Profile
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            <span className="block mb-2">Systems Encrypted</span>
            <div className="w-12 h-0.5 bg-slate-100 mx-auto rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
