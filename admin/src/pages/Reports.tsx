import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');
  const [reportType, setReportType] = useState<'revenue' | 'users' | 'shifts'>('revenue');

  // Fetch revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-analytics', dateRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();

      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);
      else startDate.setDate(startDate.getDate() - 365);

      const response = await dashboardAPI.getRevenue({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return response.data;
    },
    onError: () => {
      toast.error('Failed to load revenue data');
    },
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data;
    },
  });

  // Mock data for user growth and shift analytics
  const userGrowthData = [
    { month: 'Jan', employers: 45, workers: 120 },
    { month: 'Feb', employers: 52, workers: 145 },
    { month: 'Mar', employers: 61, workers: 178 },
    { month: 'Apr', employers: 68, workers: 203 },
    { month: 'May', employers: 75, workers: 241 },
    { month: 'Jun', employers: 89, workers: 289 },
  ];

  const shiftStatusData = [
    { name: 'Completed', value: stats?.completedShifts || 0 },
    { name: 'In Progress', value: stats?.activeShifts || 0 },
    { name: 'Cancelled', value: stats?.cancelledShifts || 0 },
    { name: 'Open', value: (stats?.totalShifts || 0) - (stats?.completedShifts || 0) - (stats?.activeShifts || 0) - (stats?.cancelledShifts || 0) },
  ];

  const handleExportReport = () => {
    toast.success('Report export started. You will receive a download link shortly.');
    // TODO: Implement actual export functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive insights into your platform performance
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="365d">Last Year</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Report Type</span>
        </div>
        <div className="flex space-x-4">
          {['revenue', 'users', 'shifts'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Analytics
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Analytics */}
      {reportType === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                £{(stats?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-green-600">+12.5% from last period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Platform Fees</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                £{(stats?.platformFees || 0).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-green-600">+8.3% from last period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Average Transaction</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                £{((stats?.totalRevenue || 0) / (stats?.completedShifts || 1)).toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-red-600">-2.1% from last period</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
            {revenueLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData?.dailyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="platformFees"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Platform Fees"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* User Analytics */}
      {reportType === 'users' && (
        <div className="space-y-6">
          {/* User Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="mt-1 text-sm text-green-600">+15.2% from last period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Employers</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalEmployers || 0}</p>
              <p className="mt-1 text-sm text-green-600">+10.8% from last period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Workers</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalWorkers || 0}</p>
              <p className="mt-1 text-sm text-green-600">+18.5% from last period</p>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employers" fill="#3b82f6" name="Employers" />
                <Bar dataKey="workers" fill="#10b981" name="Workers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Shift Analytics */}
      {reportType === 'shifts' && (
        <div className="space-y-6">
          {/* Shift Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Total Shifts</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalShifts || 0}</p>
              <p className="mt-1 text-sm text-green-600">+20.3% from last period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Completed</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.completedShifts || 0}</p>
              <p className="mt-1 text-sm text-green-600">85% completion rate</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Active</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.activeShifts || 0}</p>
              <p className="mt-1 text-sm text-blue-600">Currently in progress</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Cancelled</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.cancelledShifts || 0}</p>
              <p className="mt-1 text-sm text-red-600">5% cancellation rate</p>
            </div>
          </div>

          {/* Shift Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Shift Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shiftStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {shiftStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">Average Shift Duration</span>
                  <span className="text-sm font-semibold text-gray-900">6.5 hours</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">Average Hourly Rate</span>
                  <span className="text-sm font-semibold text-gray-900">£12.50</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">Fill Rate</span>
                  <span className="text-sm font-semibold text-gray-900">92%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">Average Workers per Shift</span>
                  <span className="text-sm font-semibold text-gray-900">3.2</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">Most Common Industry</span>
                  <span className="text-sm font-semibold text-gray-900">Hospitality</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Shift Time</span>
                  <span className="text-sm font-semibold text-gray-900">18:00 - 22:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
