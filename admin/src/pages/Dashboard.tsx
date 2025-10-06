import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import {
  UsersIcon,
  ClockIcon,
  CurrencyPoundIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data;
    },
    onError: (error: any) => {
      toast.error('Failed to load dashboard stats');
    },
  });

  // Fetch revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-analytics', dateRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();

      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else startDate.setDate(startDate.getDate() - 90);

      const response = await dashboardAPI.getRevenue({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return response.data;
    },
    onError: (error: any) => {
      toast.error('Failed to load revenue analytics');
    },
  });

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      detail: `${stats?.totalEmployers || 0} employers, ${stats?.totalWorkers || 0} workers`,
    },
    {
      name: 'Total Shifts',
      value: stats?.totalShifts || 0,
      icon: ClockIcon,
      color: 'bg-green-500',
      detail: `${stats?.completedShifts || 0} completed`,
    },
    {
      name: 'Total Revenue',
      value: `£${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyPoundIcon,
      color: 'bg-purple-500',
      detail: `£${(stats?.platformFees || 0).toLocaleString()} in fees`,
    },
    {
      name: 'Active Shifts',
      value: stats?.activeShifts || 0,
      icon: CheckCircleIcon,
      color: 'bg-orange-500',
      detail: 'Currently in progress',
    },
  ];

  if (statsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.detail}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData?.dailyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Revenue (£)"
            />
            <Area
              type="monotone"
              dataKey="platformFees"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="Platform Fees (£)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 pb-4 border-b last:border-b-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Workers</h3>
          <div className="space-y-4">
            {stats?.topWorkers?.map((worker: any, index: number) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                    <p className="text-xs text-gray-500">{worker.shiftsCompleted} shifts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    £{worker.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{worker.rating} ★</p>
                </div>
              </div>
            ))}
            {(!stats?.topWorkers || stats.topWorkers.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
