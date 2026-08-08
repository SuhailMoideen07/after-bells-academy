"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Download, Printer, BarChart3, FileSpreadsheet, Users, GraduationCap, Calendar, Sparkles } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function generateMonthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [{ value: '', label: '📅 All Time' }];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    const monthName = MONTH_NAMES[d.getMonth()];
    let label = `${monthName} ${yyyy}`;
    if (i === 0) label = `This Month (${monthName} ${yyyy})`;
    if (i === 1) label = `Last Month (${monthName} ${yyyy})`;
    options.push({ value: key, label });
  }
  return options;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'teacher' | 'student' | 'monthly'>('teacher');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');

  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const selectedMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || 'All Time';

  const fetchReport = async (type: string, month: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ type });
      if (month) query.append('month', month);
      const res = await fetch(`/api/admin/reports?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType, selectedMonth);
  }, [reportType, selectedMonth]);

  const handleExportCSV = () => {
    const query = new URLSearchParams({ type: reportType, format: 'csv' });
    if (selectedMonth) query.append('month', selectedMonth);
    window.open(`/api/admin/reports?${query.toString()}`, '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Academy Reports & Export</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate faculty performance metrics, student attendance summaries, and monthly hours for payroll.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* MONTH PERIOD FILTER + REPORT TYPE TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex-1">
          <button
            onClick={() => setReportType('teacher')}
            className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              reportType === 'teacher' ? 'bg-gold-accent text-navy-dark shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" /> Teacher-wise
          </button>
          <button
            onClick={() => setReportType('student')}
            className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              reportType === 'student' ? 'bg-gold-accent text-navy-dark shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student-wise
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              reportType === 'monthly' ? 'bg-gold-accent text-navy-dark shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" /> Monthly
          </button>
        </div>

        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full sm:w-56 p-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none font-bold text-slate-700 shadow-sm"
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* PRINTABLE REPORT DOCUMENT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              <h2 className="text-xl font-black text-navy-primary">After Bells Academy</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
              Official Executive Report • {selectedMonth ? selectedMonthLabel : 'ALL TIME'} • {reportType.toUpperCase()} SUMMARY
            </p>
          </div>
          <div className="text-right text-xs font-bold text-slate-500">
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-navy-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {reportType === 'teacher' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Teacher Name</th>
                    <th className="p-3.5">Academy Email</th>
                    <th className="p-3.5">Total Classes</th>
                    <th className="p-3.5">Completed</th>
                    <th className="p-3.5">Cancelled</th>
                    <th className="p-3.5 text-right">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-extrabold text-navy-primary">{row.name}</td>
                      <td className="p-3.5 text-slate-600">{row.email}</td>
                      <td className="p-3.5 font-bold text-slate-800">{row.totalClasses}</td>
                      <td className="p-3.5 font-bold text-emerald-600">{row.completedClasses}</td>
                      <td className="p-3.5 font-bold text-red-500">{row.cancelledClasses}</td>
                      <td className="p-3.5 font-extrabold text-navy-primary text-right">{row.totalHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'student' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Grade & Board</th>
                    <th className="p-3.5">Assigned Teacher</th>
                    <th className="p-3.5">Total Sessions</th>
                    <th className="p-3.5">Attended</th>
                    <th className="p-3.5">Cancelled</th>
                    <th className="p-3.5 text-right">Hours Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-extrabold text-navy-primary">{row.name}</td>
                      <td className="p-3.5 font-semibold text-slate-700">{row.grade} ({row.board})</td>
                      <td className="p-3.5 text-slate-700 font-bold">{row.teacher}</td>
                      <td className="p-3.5 font-bold text-slate-800">{row.totalClasses}</td>
                      <td className="p-3.5 font-bold text-emerald-600">{row.completedClasses}</td>
                      <td className="p-3.5 font-bold text-red-500">{row.cancelledClasses}</td>
                      <td className="p-3.5 font-extrabold text-navy-primary text-right">{row.totalHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'monthly' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Month</th>
                    <th className="p-3.5">Completed Classes</th>
                    <th className="p-3.5">Cancelled Classes</th>
                    <th className="p-3.5 text-right">Total Hours Taught</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((row: any) => (
                    <tr key={row.month} className="hover:bg-slate-50">
                      <td className="p-3.5 font-extrabold text-navy-primary">{row.month}</td>
                      <td className="p-3.5 font-bold text-emerald-600">{row.completed}</td>
                      <td className="p-3.5 font-bold text-red-500">{row.cancelled}</td>
                      <td className="p-3.5 font-extrabold text-navy-primary text-right">{row.totalHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
