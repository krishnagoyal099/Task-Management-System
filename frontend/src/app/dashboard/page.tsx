'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import { CheckCircle2, ListTodo, Activity, CheckSquare } from 'lucide-react';

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
}

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TaskStats>({ total: 0, todo: 0, inProgress: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [todoRes, inProgressRes, completedRes] = await Promise.all([
          api.get('/tasks?status=TODO&limit=1'),
          api.get('/tasks?status=IN_PROGRESS&limit=1'),
          api.get('/tasks?status=COMPLETED&limit=1'),
        ]);
        setStats({
          total:
            todoRes.data.data.pagination.total +
            inProgressRes.data.data.pagination.total +
            completedRes.data.data.pagination.total,
          todo: todoRes.data.data.pagination.total,
          inProgress: inProgressRes.data.data.pagination.total,
          completed: completedRes.data.data.pagination.total,
        });
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      color: 'bg-[#f1f8f1]',
      iconColor: 'bg-[#76c276] text-white',
      textColor: 'text-gray-900',
      icon: CheckCircle2,
    },
    {
      label: 'To Do',
      value: stats.todo,
      color: 'bg-[#eef8fe]',
      iconColor: 'bg-[#b6dff9] text-white',
      textColor: 'text-gray-900',
      icon: ListTodo,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: 'bg-[#f4f2ff]',
      iconColor: 'bg-[#6b5dd3] text-white',
      textColor: 'text-gray-900',
      icon: Activity,
    },
    {
      label: 'Completed',
      value: stats.completed,
      color: 'bg-[#fff4ed]',
      iconColor: 'bg-[#ff9a51] text-white',
      textColor: 'text-gray-900',
      icon: CheckSquare,
    },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">My Task</h2>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-[20px] p-6 ${card.color} shadow-sm border border-black/5 relative overflow-hidden`}
            >
              {/* Decorative background shape */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-6 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-lg font-medium text-gray-500 mb-1">{card.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className={`text-5xl font-extrabold tracking-tight ${card.textColor}`}>
                  {isLoading ? (
                    <span className="inline-block h-10 w-16 animate-pulse rounded bg-black/10" />
                  ) : (
                    card.value
                  )}
                </p>
                <span className="text-xl font-bold text-gray-600">Task</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Overview</h2>
      </div>

      {/* Overview Cards styled like "Recently Visit" */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Progress Card */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-md">
                Metrics
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Completion Rate</h3>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              A quick overview of how many tasks you have successfully completed.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-500">Progress</span>
              <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-[#76c276] transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="inline-block px-4 py-1.5 bg-[#eef8fe] text-[#6cbaf1] text-sm font-semibold rounded-md">
                Quick Actions
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Manage Workflow</h3>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              Create new tasks or view your full task board seamlessly.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/tasks?create=true" className="flex-1 bg-gray-900 text-white text-center text-base font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors">
              New Task
            </Link>
            <Link href="/tasks" className="flex-1 bg-gray-100 text-gray-700 text-center text-base font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              View All
            </Link>
          </div>
        </div>

        {/* Admin Card (conditionally rendered but styled nicely) */}
        {user?.role === 'ADMIN' && (
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
            <div className="flex justify-between items-start mb-6">
                <span className="inline-block px-4 py-1.5 bg-[#fff4ed] text-[#ff9a51] text-sm font-semibold rounded-md">
                  Admin Panel
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Global Oversight</h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                You have admin privileges. View and manage all users&apos; tasks globally.
              </p>
            </div>
            <Link href="/tasks" className="w-full block bg-[#ff9a51] text-white text-center text-base font-semibold py-3 rounded-xl hover:bg-[#e88844] transition-colors">
              Manage All Tasks
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}