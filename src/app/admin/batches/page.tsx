"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Layers, Search, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import type { Batch, Student, Subject } from '@/types/tms';
import { useAdminData } from '@/context/AdminDataContext';

export default function BatchesManagementPage() {
  const {
    batches,
    students,
    loading,
    addBatchLocally,
    deleteBatchLocally,
    refetchAdminData,
  } = useAdminData();
  const [search, setSearch] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Expanded batch viewer
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingBatch(null);
    setName('');
    setSelectedStudentIds([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setName(batch.name);
    setSelectedStudentIds(batch.student_ids || []);
    setModalOpen(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      alert('Please enter a batch name');
      return;
    }

    try {
      const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
      const studentNames = selectedStudents.map(s => s.name);

      const url = '/api/admin/batches';
      const method = editingBatch ? 'PUT' : 'POST';
      const payload = {
        ...(editingBatch && { id: editingBatch.id }),
        name: name.trim(),
        student_ids: selectedStudentIds,
        student_names: studentNames,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save batch');

      setModalOpen(false);
      if (data.batch) addBatchLocally(data.batch);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error saving batch');
    }
  };

  const handleDeleteBatch = async (id: string, batchTitle: string) => {
    if (!confirm(`Are you sure you want to delete batch "${batchTitle}"?`)) return;

    try {
      deleteBatchLocally(id);
      const res = await fetch(`/api/admin/batches?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete batch');
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting batch');
      refetchAdminData();
    }
  };

  const filteredBatches = batches
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Batches Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, view, edit, and organize student study batches across After Bells Academy.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Batch
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search batches by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-navy-primary"
          />
        </div>
      </div>

      {/* BATCHES GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-semibold">Loading batches...</div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-navy-primary text-sm">No Batches Found</p>
          <p className="text-xs text-slate-500 mt-1">Click "Create New Batch" to add your first study group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBatches.map(batch => {
            const enrolledCount = batch.student_names?.length || batch.student_ids?.length || 0;
            const isExpanded = expandedBatchId === batch.id;

            return (
              <div
                key={batch.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-extrabold text-[11px] rounded-full border border-gold-accent/30">
                        👥 {enrolledCount} Students
                      </span>
                    </div>

                    <h3 className="text-base font-black text-navy-primary mt-1">{batch.name}</h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(batch)}
                      className="p-2 text-slate-600 hover:text-navy-primary hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit Batch"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch.id, batch.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Enrolled Student Avatar Chips */}
                {batch.student_names && batch.student_names.length > 0 ? (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Enrolled Students ({batch.student_names.length})</span>
                      <button
                        onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)}
                        className="text-navy-primary hover:underline font-bold"
                      >
                        {isExpanded ? 'Hide Details' : 'View Full Details'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[...batch.student_names]
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                        .map(sName => (
                          <span
                            key={sName}
                            className="px-2.5 py-1 bg-white text-navy-primary font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1"
                          >
                            👤 {sName}
                          </span>
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    No students assigned to this batch yet. Click edit to add students.
                  </p>
                )}

                {/* Expanded Detailed Student Cards */}
                {isExpanded && batch.student_ids && batch.student_ids.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in-50">
                    <p className="text-xs font-black uppercase tracking-wider text-navy-primary">Student Contacts & Details</p>
                    <div className="grid grid-cols-1 gap-2">
                      {students
                        .filter(s => batch.student_ids?.includes(s.id))
                        .map(std => (
                          <div key={std.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-navy-primary">{std.name}</span>
                              <span className="text-[10px] text-slate-500 block">{std.grade_class} • {std.board}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">📞 {std.phone}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE / EDIT BATCH */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary">
              {editingBatch ? 'Edit Batch Details' : 'Create New Batch'}
            </h3>
            <p className="text-xs text-slate-500">
              Set batch name, subject, and select enrolled students for this study group.
            </p>

            <form onSubmit={handleSaveBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Batch Name / Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. AFTER BELLS | BATCH A-01"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Assigned Students ({selectedStudentIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStudentIds.length === students.length) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(students.map(s => s.id));
                      }
                    }}
                    className="text-[11px] font-bold text-navy-primary hover:underline"
                  >
                    {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                  {students.map(s => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected ? 'bg-gold-light/60 border border-gold-accent/40 text-navy-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, s.id]);
                            } else {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-navy-primary focus:ring-navy-primary"
                        />
                        <span className="flex-1">{s.name} <span className="text-[10px] text-slate-500">({s.grade_class} - {s.board})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md"
                >
                  {editingBatch ? 'Save Changes' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
