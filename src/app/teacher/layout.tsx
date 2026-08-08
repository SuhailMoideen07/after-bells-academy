import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Dashboard | After Bells Academy',
  description: 'Teacher Portal for live online class management, student tracking, and automated schedules.',
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {children}
    </div>
  );
}
