"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Github, Chrome } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -ml-32 -mb-32" />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-up">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          BACK TO DASHBOARD
        </Link>

        {/* Branding */}
        <div className="mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-xl shadow-slate-200">
            B
          </div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-tight mb-3">
            Welcome back to <br /> Institutional Intelligence.
          </h1>
          <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
            Log in to access your personalized current affairs briefing and practice units.
          </p>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="flex items-center justify-center gap-3 h-[52px] rounded-2xl border border-slate-100 bg-white text-[14px] font-bold text-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98]">
            <Chrome size={18} /> Google
          </button>
          <button className="flex items-center justify-center gap-3 h-[52px] rounded-2xl border border-slate-100 bg-white text-[14px] font-bold text-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98]">
            <Github size={18} /> Github
          </button>
        </div>

        <div className="relative mb-8 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100" />
          <span className="relative z-10 bg-white px-4">Or continue with email</span>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="venkatesh@service.com"
                className="w-full h-[60px] pl-14 pr-6 rounded-2xl bg-white border border-slate-100 text-[15px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900/10 focus:border-slate-300 transition-all shadow-sm shadow-slate-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Security Pin</label>
              <Link href="#" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full h-[60px] pl-14 pr-16 rounded-2xl bg-white border border-slate-100 text-[15px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900/10 focus:border-slate-300 transition-all shadow-sm shadow-slate-50"
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

          <button className="w-full h-[64px] bg-slate-900 text-white rounded-2xl font-bold text-[16px] shadow-2xl shadow-slate-300 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-8">
            Initialize Session
          </button>
        </form>

        <p className="mt-10 text-center text-[14px] font-medium text-slate-500">
          Not yet authenticated?{" "}
          <Link href="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4">Register Personnel</Link>
        </p>
      </div>
    </div>
  );
}
