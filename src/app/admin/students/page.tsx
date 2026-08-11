"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Trash2, Edit3, Phone, GraduationCap } from 'lucide-react';
import type { Student } from '@/types/tms';
import { useAdminData } from '@/context/AdminDataContext';

export default function StudentManagementPage() {
  const {
    students,
    teachers,
    loading,
    addStudentLocally,
    updateStudentLocally,
    deleteStudentLocally,
    refetchAdminData,
  } = useAdminData();
  const [search, setSearch] = useState('');

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [gradeClass, setGradeClass] = useState('Grade 10');
  const [board, setBoard] = useState('CBSE');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Physics');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editGradeClass, setEditGradeClass] = useState('Grade 10');
  const [editBoard, setEditBoard] = useState('CBSE');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAssignedTeacherId, setEditAssignedTeacherId] = useState('');
  const [editSubjectsStr, setEditSubjectsStr] = useState('');

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacherIdToAssign = assignedTeacherId || (teachers[0]?.id || '');
    if (!name || !guardianName || !phone || !teacherIdToAssign) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          grade_class: gradeClass,
          board,
          guardian_name: guardianName,
          phone,
          assigned_teacher_id: teacherIdToAssign,
          subjects,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      setAddModalOpen(false);
      setName('');
      setGuardianName('');
      setPhone('');
      if (data.student) addStudentLocally(data.student);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error adding student');
    }
  };

  const handleOpenEditModal = (std: Student) => {
    setSelectedStudent(std);
    setEditName(std.name);
    setEditGradeClass(std.grade_class);
    setEditBoard(std.board);
    setEditGuardianName(std.guardian_name);
    setEditPhone(std.phone);
    setEditAssignedTeacherId(std.assigned_teacher_id || (teachers[0]?.id || ''));
    setEditSubjectsStr((std.subjects || []).join(', '));
    setEditModalOpen(true);
  };

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const subjects = editSubjectsStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          name: editName,
          grade_class: editGradeClass,
          board: editBoard,
          guardian_name: editGuardianName,
          phone: editPhone,
          assigned_teacher_id: editAssignedTeacherId,
          subjects,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student');

      setEditModalOpen(false);
      setSelectedStudent(null);
      if (data.student) updateStudentLocally(selectedStudent.id, data.student);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      deleteStudentLocally(id);
      const res = await fetch(`/api/admin/students?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        refetchAdminData();
      } else {
        refetchAdminData();
      }
    } catch (err) {
      console.error(err);
      refetchAdminData();
    }
  };

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.guardian_name.toLowerCase().includes(search.toLowerCase()) ||
      s.board.toLowerCase().includes(search.toLowerCase()) ||
      (s.assigned_teacher_name && s.assigned_teacher_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-500 mt-1">Enroll students, select curriculums, and map to assigned primary teachers.</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Enroll New Student
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search students by name, guardian, board, or assigned teacher..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-navy-primary shadow-sm"
        />
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-bold text-[10px] rounded-full uppercase">
                  {s.board} • {s.grade_class}
                </span>
                <h3 className="text-base font-black text-navy-primary mt-2">{s.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Guardian: {s.guardian_name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(s)}
                  className="p-2 text-slate-400 hover:text-navy-primary transition-colors"
                  title="Edit Student Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStudent(s.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-gold-accent" /> Assigned Teacher: <span className="font-bold text-navy-primary">{s.assigned_teacher_name || 'Unassigned'}</span>
              </p>
              <p className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone: <span className="font-bold text-slate-800">{s.phone}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
              {s.subjects.map(subj => (
                <span key={subj} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full">
                  {subj}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD STUDENT */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Enroll New Student</h3>
            <p className="text-xs text-slate-500 mb-4">Input student details and map to a teacher.</p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Student Full Name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Grade / Class</label>
                  <select
                    value={gradeClass}
                    onChange={e => setGradeClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Education Board</label>
                  <select
                    value={board}
                    onChange={e => setBoard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {['CBSE', 'ICSE', 'State Syllabus', 'IGCSE', 'GCSE'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assign Primary Teacher</label>
                <select
                  value={assignedTeacherId}
                  onChange={e => setAssignedTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjects.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Enrolled Subjects</label>
                <input
                  type="text"
                  value={subjectsStr}
                  onChange={e => setSubjectsStr(e.target.value)}
                  placeholder="Mathematics, Physics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {editModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Edit Student Details</h3>
            <p className="text-xs text-slate-500 mb-4">Modify information for {selectedStudent.name}.</p>

            <form onSubmit={handleSaveEditStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="e.g. Student Full Name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Grade / Class</label>
                  <select
                    value={editGradeClass}
                    onChange={e => setEditGradeClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Education Board</label>
                  <select
                    value={editBoard}
                    onChange={e => setEditBoard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {['CBSE', 'ICSE', 'State Syllabus', 'IGCSE', 'GCSE'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={editGuardianName}
                    onChange={e => setEditGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assign Primary Teacher</label>
                <select
                  value={editAssignedTeacherId}
                  onChange={e => setEditAssignedTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjects.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Enrolled Subjects</label>
                <input
                  type="text"
                  value={editSubjectsStr}
                  onChange={e => setEditSubjectsStr(e.target.value)}
                  placeholder="Mathematics, Physics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
