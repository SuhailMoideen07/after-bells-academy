"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedLink, setSimulatedLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setSimulatedLink('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request. Please try again.');
      }

      setSuccessMsg(data.message || 'If an account exists with this email, a reset link has been sent.');
      if (data.resetLink) {
        setSimulatedLink(data.resetLink);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1528] via-[#101F3B] to-[#0A1324] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-3">
            <div className="bg-white p-2.5 rounded-xl shadow-md inline-block">
              <img
                src="/logo.png"
                alt="After Bells Academy Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reset Account <span className="text-gold-accent">Password</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Enter your registered email address to receive a password reset link.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111C35] p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/80">
          {error && (
            <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Request Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

              {successMsg ? (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-white font-extrabold text-base">Check Your Inbox</h3>
              <p className="text-slate-300 text-xs leading-relaxed">{successMsg}</p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-gold-accent hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  YOUR REGISTERED EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#0A1224] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-accent text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                fullWidth
                size="lg"
                disabled={loading}
                className="font-bold text-navy-dark shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                icon={
                  loading ? (
                    <div className="w-4 h-4 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )
                }
              >
                {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
