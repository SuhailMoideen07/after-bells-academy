"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  Phone,
  Calendar,
  Edit3,
  Scissors,
  RotateCcw,
  Check,
  X,
  FileText,
  IndianRupee,
  BadgeAlert,
  ArrowUpRight,
} from 'lucide-react';
import type { FeeRecord, MonthlyFeeSummary } from '@/types/tms';
import { useAdminData } from '@/context/AdminDataContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthDisplay(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [y, m] = monthKey.split('-');
  const monthIdx = parseInt(m, 10) - 1;
  return `${MONTH_NAMES[monthIdx] || m} ${y}`;
}

function generateMonthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  // Current month + past 11 months + next 2 months
  for (let i = -2; i <= 11; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    const monthName = MONTH_NAMES[d.getMonth()];
    let label = `${monthName} ${yyyy}`;
    if (i === 0) label = `Current Month (${monthName} ${yyyy})`;
    options.push({ value: key, label });
  }
  return options;
}

export default function FeeManagementPage() {
  const { students, refetchAdminData } = useAdminData();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<MonthlyFeeSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'partial' | 'prorated'>('all');

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState<string>('');
  const [payRemarks, setPayRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Proration modal state
  const [prorateModalOpen, setProrateModalOpen] = useState(false);
  const [prorateRecord, setProrateRecord] = useState<FeeRecord | null>(null);
  const [prorateAmount, setProrateAmount] = useState<string>('');
  const [prorateReason, setProrateReason] = useState<string>('');

  // Receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<FeeRecord | null>(null);

  // Base fee quick edit modal state
  const [baseFeeModalOpen, setBaseFeeModalOpen] = useState(false);
  const [baseFeeRecord, setBaseFeeRecord] = useState<FeeRecord | null>(null);
  const [newBaseFee, setNewBaseFee] = useState<string>('');

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const fetchFeeData = async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fees?month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData(selectedMonth);
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  // 1-Click Quick Mark as Paid
  const handleQuickMarkPaid = async (record: FeeRecord) => {
    if (record.status === 'paid') return;
    const confirmPay = window.confirm(`Mark ₹${record.amount_due} as FULLY PAID for ${record.student_name}?`);
    if (!confirmPay) return;

    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_paid',
          id: record.id,
          payment_method: 'UPI',
          remarks: 'Quick marked as paid',
        }),
      });

      if (res.ok) {
        fetchFeeData(selectedMonth);
        refetchAdminData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to mark fee as paid');
    }
  };

  // Open detailed payment record modal
  const handleOpenPaymentModal = (record: FeeRecord) => {
    setSelectedRecord(record);
    const defaultAmount = record.status === 'partial'
      ? String(record.amount_due - record.amount_paid)
      : String(record.amount_due);
    setPayAmount(defaultAmount);
    setPayMethod(record.payment_method || 'UPI');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayRef(record.transaction_ref || '');
    setPayRemarks(record.remarks || '');
    setPaymentModalOpen(true);
  };

  // Submit payment modal
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || isSubmitting) return;

    const parsedPaid = parseFloat(payAmount);
    if (isNaN(parsedPaid) || parsedPaid < 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRecord.id,
          amount_paid: parsedPaid,
          payment_date: payDate,
          payment_method: payMethod,
          transaction_ref: payRef,
          remarks: payRemarks,
        }),
      });

      if (res.ok) {
        setPaymentModalOpen(false);
        fetchFeeData(selectedMonth);
        refetchAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update payment');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open manual proration modal
  const handleOpenProrateModal = (record: FeeRecord) => {
    setProrateRecord(record);
    setProrateAmount(String(record.amount_due));
    setProrateReason(record.proration_reason || 'Joined mid-month');
    setProrateModalOpen(true);
  };

  // Submit manual proration
  const handleSaveProration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prorateRecord || isSubmitting) return;

    const parsedAmount = parseFloat(prorateAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Please enter a valid reduced fee amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prorate',
          id: prorateRecord.id,
          prorated_amount: parsedAmount,
          reason: prorateReason,
        }),
      });

      if (res.ok) {
        setProrateModalOpen(false);
        fetchFeeData(selectedMonth);
        refetchAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to apply proration');
      }
    } catch (err) {
      console.error(err);
      alert('Error applying prorated fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset proration back to base fee
  const handleResetProration = async (record: FeeRecord) => {
    if (!confirm(`Reset ${record.student_name}'s fee back to standard monthly fee (₹${record.base_amount || 0})?`)) return;

    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_proration',
          id: record.id,
        }),
      });

      if (res.ok) {
        setProrateModalOpen(false);
        fetchFeeData(selectedMonth);
        refetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open base fee edit modal
  const handleOpenBaseFeeModal = (record: FeeRecord) => {
    setBaseFeeRecord(record);
    setNewBaseFee(String(record.base_amount || record.amount_due || '0'));
    setBaseFeeModalOpen(true);
  };

  // Save new base fee for student
  const handleSaveBaseFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseFeeRecord || isSubmitting) return;

    const parsed = parseFloat(newBaseFee);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid fee amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_student_fee',
          id: baseFeeRecord.id,
          student_id: baseFeeRecord.student_id,
          monthly_fee: parsed,
          month: selectedMonth,
        }),
      });

      if (res.ok) {
        setBaseFeeModalOpen(false);
        fetchFeeData(selectedMonth);
        refetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open receipt modal
  const handleOpenReceipt = (record: FeeRecord) => {
    setReceiptRecord(record);
    setReceiptModalOpen(true);
  };

  // Print receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.guardian_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.phone || '').includes(search) ||
        (r.assigned_teacher_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.board || '').toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'paid') return r.status === 'paid';
      if (statusFilter === 'pending') return r.status === 'pending';
      if (statusFilter === 'partial') return r.status === 'partial';
      if (statusFilter === 'prorated') return r.is_prorated;
      return true;
    });
  }, [records, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-navy-primary text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-gold-accent/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gold-accent uppercase tracking-widest block">
                After Bells Academy • Financial Accounting
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-7 h-7 text-gold-accent" /> Student Fee Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Track student fee payments, record manual mid-month prorated discounts, monitor monthly revenue collections, and issue official payment receipts.
            </p>
          </div>

          {/* Month Navigator Toolbar */}
          <div className="bg-navy-dark/90 p-2 rounded-2xl border border-gold-accent/30 flex items-center gap-2 self-start md:self-auto shadow-inner">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-4 h-4 text-gold-accent" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer pr-1"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-navy-dark text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedMonth !== getCurrentMonthKey() && (
              <button
                onClick={() => setSelectedMonth(getCurrentMonthKey())}
                className="px-2.5 py-1 text-[10px] font-extrabold bg-gold-accent text-navy-dark rounded-lg hover:bg-gold-hover transition-all ml-1"
              >
                Current
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MONTHLY EXECUTIVE FINANCIAL SUMMARY */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Collected */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Received</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
              ₹ {summary.totalReceived.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
              {summary.paidCount} Fully Paid
            </p>
          </div>

          {/* Total Pending */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Pending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
              ₹ {summary.totalPending.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 inline" />
              {summary.pendingCount} Pending Collection
            </p>
          </div>

          {/* Total Expected Revenue */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Expected Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-navy-subtle text-navy-primary flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-navy-primary mt-2">
              ₹ {summary.totalExpected.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {summary.totalStudents} Active Students Billed
            </p>
          </div>

          {/* Collection Progress Rate */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Collection Rate</span>
              <div className="w-8 h-8 rounded-xl bg-gold-light text-navy-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold-accent" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl sm:text-3xl font-black text-navy-primary">{summary.collectionRate}%</p>
              <span className="text-xs text-slate-500 font-bold">collected</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.collectionRate)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FILTER AND SEARCH CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name, guardian, teacher, phone, or grade..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-navy-primary shadow-sm"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All (${records.length})` },
            { id: 'paid', label: `Paid (${records.filter(r => r.status === 'paid').length})` },
            { id: 'pending', label: `Pending (${records.filter(r => r.status === 'pending').length})` },
            { id: 'partial', label: `Partial (${records.filter(r => r.status === 'partial').length})` },
            { id: 'prorated', label: `Prorated (${records.filter(r => r.is_prorated).length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-navy-primary text-white shadow-sm font-extrabold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* FEES TABLE / CARDS */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-navy-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-navy-primary">No student fee records found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {records.length === 0
              ? `No active students billed for ${formatMonthDisplay(selectedMonth)}.`
              : `No student records match the search filter "${search}".`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student & Details</th>
                  <th className="py-3.5 px-4">Assigned Teacher</th>
                  <th className="py-3.5 px-4">Monthly Fee</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4">Payment Details</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(rec => {
                  const isPaid = rec.status === 'paid';
                  const isPartial = rec.status === 'partial';
                  const isPending = rec.status === 'pending';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-navy-primary text-sm">
                          {rec.student_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                            {rec.board} • {rec.grade_class}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Guardian: {rec.guardian_name}
                          </span>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-gold-accent" />
                          {rec.assigned_teacher_name || 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Ph: {rec.phone}
                        </span>
                      </td>

                      {/* Monthly Fee Amount & Proration Tag */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-navy-primary">
                            ₹ {rec.amount_due.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleOpenBaseFeeModal(rec)}
                            className="p-1 text-slate-400 hover:text-navy-primary transition-colors"
                            title="Edit baseline monthly fee for this student"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* If Prorated, show prominent badge */}
                        {rec.is_prorated ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-md">
                              <Scissors className="w-3 h-3" />
                              Prorated (Base: ₹{rec.base_amount || rec.amount_due})
                            </span>
                            {rec.proration_reason && (
                              <span className="block text-[10px] text-purple-600 font-medium mt-0.5 truncate max-w-xs">
                                Note: {rec.proration_reason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">Standard Rate</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-full border border-emerald-300 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-300 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                          </span>
                        )}
                        {isPartial && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 font-extrabold text-[11px] rounded-full border border-blue-300 shadow-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Partially Paid
                          </span>
                        )}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-sm text-slate-800">
                          ₹ {rec.amount_paid.toLocaleString('en-IN')}
                        </span>
                        {isPartial && (
                          <span className="block text-[10px] text-amber-600 font-bold">
                            ₹ {(rec.amount_due - rec.amount_paid).toLocaleString('en-IN')} balance
                          </span>
                        )}
                      </td>

                      {/* Payment Details */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {rec.amount_paid > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block text-[11px]">
                              Mode: {rec.payment_method || 'UPI'}
                            </span>
                            {rec.payment_date && (
                              <span className="text-[10px] text-slate-500 block">
                                Date: {rec.payment_date.split('T')[0]}
                              </span>
                            )}
                            {rec.transaction_ref && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Ref: {rec.transaction_ref}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No payment recorded</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1-Click Quick Mark Paid Button */}
                          {!isPaid && (
                            <button
                              onClick={() => handleQuickMarkPaid(rec)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-all"
                              title="1-Click Mark as Fully Paid"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark Paid
                            </button>
                          )}

                          {/* Detailed Record Payment Modal */}
                          <button
                            onClick={() => handleOpenPaymentModal(rec)}
                            className="px-2.5 py-1.5 bg-navy-primary hover:bg-navy-dark text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-all"
                            title="Record Payment Details"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> {isPaid ? 'Edit Pay' : 'Record Pay'}
                          </button>

                          {/* Manual Prorate Button */}
                          <button
                            onClick={() => handleOpenProrateModal(rec)}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg transition-all"
                            title="Manually adjust or prorate fee for mid-month joiner"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                          </button>

                          {/* Printable Receipt */}
                          <button
                            onClick={() => handleOpenReceipt(rec)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-all"
                            title="View / Print Official Fee Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. RECORD PAYMENT MODAL */}
      {paymentModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-navy-primary">Record Fee Payment</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Student: <span className="font-bold text-navy-primary">{selectedRecord.student_name}</span> ({selectedRecord.grade_class})
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Total Billable Due:</span>
                <span className="font-black text-navy-primary text-base">
                  ₹ {selectedRecord.amount_due.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-navy-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Transaction Reference / UPI Ref ID
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. UPI-1234567890 or Receipt #"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={payRemarks}
                  onChange={e => setPayRemarks(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-gold-accent" /> Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MANUAL PRORATION / REDUCED FEE MODAL */}
      {prorateModalOpen && prorateRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-navy-primary flex items-center gap-2">
                <Scissors className="w-5 h-5 text-purple-600" /> Manual Prorate / Adjust Fee
              </h3>
              <button
                onClick={() => setProrateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Reduce the fee for student <span className="font-bold text-navy-primary">{prorateRecord.student_name}</span> for {formatMonthDisplay(selectedMonth)} when joining mid-month.
            </p>

            <form onSubmit={handleSaveProration} className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1">
                <div className="flex justify-between font-medium text-purple-900">
                  <span>Standard Monthly Fee:</span>
                  <span className="font-black text-sm">
                    ₹ {(prorateRecord.base_amount || prorateRecord.amount_due).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-purple-700">
                  Enter whatever reduced amount you decided to charge. No automatic deductions are applied.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Adjusted Prorated Fee Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={prorateAmount}
                  onChange={e => setProrateAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-navy-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Reason / Explanation Note
                </label>
                <input
                  type="text"
                  value={prorateReason}
                  onChange={e => setProrateReason(e.target.value)}
                  placeholder="e.g. Joined mid-month on 18th Sept"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  This note will be shown on the parent's payment receipt.
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {prorateRecord.is_prorated ? (
                  <button
                    type="button"
                    onClick={() => handleResetProration(prorateRecord)}
                    className="py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to Standard
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProrateModalOpen(false)}
                    className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    Apply Prorated Fee
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BASELINE FEE QUICK EDIT MODAL */}
      {baseFeeModalOpen && baseFeeRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-navy-primary mb-1">Set Student Baseline Fee</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update {baseFeeRecord.student_name}'s standard monthly fee.
            </p>

            <form onSubmit={handleSaveBaseFee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Monthly Fee (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newBaseFee}
                  onChange={e => setNewBaseFee(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-navy-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBaseFeeModalOpen(false)}
                  className="py-2 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-sm"
                >
                  Update Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. OFFICIAL PRINTABLE RECEIPT MODAL */}
      {receiptModalOpen && receiptRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[95vh] overflow-y-auto print:shadow-none print:border-none print:max-h-full print:m-0">
            {/* Top Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between mb-4 print:hidden border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gold-accent" /> Fee Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 border-2 border-slate-800 rounded-2xl space-y-6 print:border-slate-800">
              {/* Header with Academy Branding */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="After Bells" className="h-12 w-auto" />
                  <div>
                    <h2 className="text-lg font-black text-navy-primary uppercase tracking-tight">After Bells Academy</h2>
                    <p className="text-[10px] text-slate-600 font-medium">Curiosity Begins After the Last Bell.</p>
                    <p className="text-[10px] text-slate-500">Phone: +91 96564 27537 • info@afterbells.in</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 bg-navy-primary text-white font-black text-[10px] rounded uppercase tracking-wider block">
                    FEE RECEIPT
                  </span>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    REC-{receiptRecord.id.replace('fee_', '').substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Date: {receiptRecord.payment_date ? receiptRecord.payment_date.split('T')[0] : new Date().toISOString().split('T')[0]}
                  </p>
                </div>
              </div>

              {/* Student & Guardian Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Details</span>
                  <p className="font-extrabold text-navy-primary text-sm mt-0.5">{receiptRecord.student_name}</p>
                  <p className="text-slate-600 font-medium">{receiptRecord.board} • {receiptRecord.grade_class}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Billing Period & Teacher</span>
                  <p className="font-bold text-slate-800 mt-0.5">Month: {formatMonthDisplay(receiptRecord.month)}</p>
                  <p className="text-slate-600 font-medium">Faculty: {receiptRecord.assigned_teacher_name || 'After Bells Academy'}</p>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-extrabold uppercase text-[10px] text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5">
                        <span className="font-bold text-navy-primary block">
                          Tuition Fee - {formatMonthDisplay(receiptRecord.month)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Standard regular curriculum sessions
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        ₹ {(receiptRecord.base_amount || receiptRecord.amount_due).toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Prorated line item if applicable */}
                    {receiptRecord.is_prorated && (
                      <tr className="bg-purple-50/50">
                        <td className="p-2.5 text-purple-900">
                          <span className="font-bold block">
                            Mid-Month Admission Adjustment / Discount
                          </span>
                          <span className="text-[10px] text-purple-700 italic">
                            Reason: {receiptRecord.proration_reason || 'Prorated fee'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-bold text-purple-700">
                          - ₹ {Math.max(0, (receiptRecord.base_amount || 0) - receiptRecord.amount_due).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}

                    {/* Net Total Due */}
                    <tr className="bg-slate-50 font-black">
                      <td className="p-2.5 text-navy-primary">Total Fee Due:</td>
                      <td className="p-2.5 text-right text-navy-primary text-sm">
                        ₹ {receiptRecord.amount_due.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Amount Paid */}
                    <tr className="font-black text-emerald-700 bg-emerald-50/60">
                      <td className="p-2.5">Total Amount Paid:</td>
                      <td className="p-2.5 text-right text-base">
                        ₹ {receiptRecord.amount_paid.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Remaining Balance if partial */}
                    {receiptRecord.amount_due > receiptRecord.amount_paid && (
                      <tr className="text-amber-700 bg-amber-50 font-bold">
                        <td className="p-2.5">Balance Pending:</td>
                        <td className="p-2.5 text-right">
                          ₹ {(receiptRecord.amount_due - receiptRecord.amount_paid).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment Verification Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-bold text-navy-primary">{receiptRecord.payment_method || 'UPI / Online'}</span>
                </div>
                {receiptRecord.transaction_ref && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Ref / Txn ID:</span>
                    <span className="font-mono text-slate-800">{receiptRecord.transaction_ref}</span>
                  </div>
                )}
                {receiptRecord.remarks && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Remarks:</span>
                    <span className="text-slate-700 italic">{receiptRecord.remarks}</span>
                  </div>
                )}
              </div>

              {/* Footer Stamp & Signature */}
              <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
                <div className="text-[10px] text-slate-400">
                  <p className="font-bold text-slate-600">Computer Generated Official Receipt</p>
                  <p>Thank you for choosing After Bells Academy.</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Authorized Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
