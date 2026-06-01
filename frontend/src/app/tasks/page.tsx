'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG = {
  TODO: { label: 'To Do', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
};

function TasksContent() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalStatus, setModalStatus] = useState<'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('TODO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch {
      showToast('Failed to fetch tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, sortBy, sortOrder, showToast]);

  useEffect(() => {
    // Disable set-state-in-effect warning for initial data fetching
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks(1);
  }, [fetchTasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalTitle('');
    setModalDescription('');
    setModalStatus('TODO');
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalTitle(task.title);
    setModalDescription(task.description || '');
    setModalStatus(task.status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setModalTitle('');
    setModalDescription('');
    setModalStatus('TODO');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;
    setIsSubmitting(true);

    try {
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, {
          title: modalTitle,
          description: modalDescription || null,
          status: modalStatus,
        });
        showToast('Task updated successfully!');
      } else {
        await api.post('/tasks', {
          title: modalTitle,
          description: modalDescription || null,
          status: modalStatus,
        });
        showToast('Task created successfully!');
      }
      closeModal();
      fetchTasks(pagination.page);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Operation failed';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      showToast('Task deleted successfully!');
      setDeletingTaskId(null);
      fetchTasks(pagination.page);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      showToast('Status updated!');
      fetchTasks(pagination.page);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'ADMIN' ? 'All tasks across users' : 'Your tasks'}
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field !py-2 min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field !py-2 min-w-[140px]"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field !py-2 min-w-[100px]"
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter || searchQuery
                ? 'Try adjusting your filters'
                : 'Create your first task to get started!'}
            </p>
            {!statusFilter && !searchQuery && (
              <button onClick={openCreateModal} className="btn-primary mt-4">
                + New Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-primary-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[task.status].color}`}>
                      {STATUS_CONFIG[task.status].label}
                    </span>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                    {task.user && user?.role === 'ADMIN' && (
                      <span>By {task.user.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Quick Status Change */}
                  {task.status !== 'COMPLETED' && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  )}
                  <button
                    onClick={() => openEditModal(task)}
                    className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingTaskId(task.id)}
                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTasks(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary !px-3 !py-1.5 text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => fetchTasks(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary !px-3 !py-1.5 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="input-field"
                  placeholder="Task title"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Task description (optional)"
                  maxLength={1000}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'COMPLETED')}
                  className="input-field"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900">Delete Task?</h3>
            <p className="mt-2 text-sm text-gray-500">
              This action cannot be undone. The task will be permanently deleted.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeletingTaskId(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingTaskId)} className="btn-danger flex-1">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksContent />
    </ProtectedRoute>
  );
}