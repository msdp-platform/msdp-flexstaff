import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Cog6ToothIcon,
  CurrencyPoundIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'security' | 'notifications'>('general');

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await settingsAPI.get();
      return response.data;
    },
    onError: () => {
      toast.error('Failed to load settings');
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: any) => settingsAPI.update(updatedSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const [formData, setFormData] = useState({
    platformName: settings?.platformName || 'FlexStaff',
    platformEmail: settings?.platformEmail || 'admin@flexstaff.com',
    supportEmail: settings?.supportEmail || 'support@flexstaff.com',
    platformFeePercentage: settings?.platformFeePercentage || 10,
    minHourlyRate: settings?.minHourlyRate || 9.5,
    maxHourlyRate: settings?.maxHourlyRate || 50,
    defaultCurrency: settings?.defaultCurrency || 'GBP',
    requireEmployerVerification: settings?.requireEmployerVerification || true,
    requireWorkerVerification: settings?.requireWorkerVerification || true,
    autoApproveEmployers: settings?.autoApproveEmployers || false,
    autoApproveWorkers: settings?.autoApproveWorkers || false,
    emailNotifications: settings?.emailNotifications || true,
    smsNotifications: settings?.smsNotifications || false,
    pushNotifications: settings?.pushNotifications || true,
    maintenanceMode: settings?.maintenanceMode || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'payment', name: 'Payment', icon: CurrencyPoundIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">System Settings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure platform-wide settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Email
                </label>
                <input
                  type="email"
                  value={formData.platformEmail}
                  onChange={(e) => handleInputChange('platformEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
                  Enable Maintenance Mode
                </label>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee Percentage
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.platformFeePercentage}
                    onChange={(e) => handleInputChange('platformFeePercentage', parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of each transaction taken as platform fee
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Hourly Rate
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.minHourlyRate}
                    onChange={(e) => handleInputChange('minHourlyRate', parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">/hour</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Minimum allowed hourly rate for shifts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Hourly Rate
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.maxHourlyRate}
                    onChange={(e) => handleInputChange('maxHourlyRate', parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">/hour</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum allowed hourly rate for shifts
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• All payments are processed through Stripe Connect</p>
                  <p>• Payments are held for 7 days after shift completion</p>
                  <p>• Automatic PAYE and NI deductions for workers</p>
                  <p>• Platform receives fees after successful shift completion</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Require Employer Verification
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Employers must verify their identity before posting shifts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.requireEmployerVerification}
                    onChange={(e) => handleInputChange('requireEmployerVerification', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Require Worker Verification
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Workers must verify their identity before applying for shifts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.requireWorkerVerification}
                    onChange={(e) => handleInputChange('requireWorkerVerification', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Auto-Approve Employers
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically approve employer registrations
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoApproveEmployers}
                    onChange={(e) => handleInputChange('autoApproveEmployers', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Auto-Approve Workers
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically approve worker registrations
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoApproveWorkers}
                    onChange={(e) => handleInputChange('autoApproveWorkers', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Security Recommendations</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• Keep verification requirements enabled for security</p>
                  <p>• Manual approval reduces fraud risk</p>
                  <p>• Review all verification documents regularly</p>
                  <p>• Monitor suspicious activity in the admin dashboard</p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Send email notifications to users for important events
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Send SMS notifications for critical updates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications}
                    onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Send push notifications to mobile app users
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications}
                    onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Notification Events</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• New shift posted</p>
                  <p>• Shift application received</p>
                  <p>• Shift accepted/rejected</p>
                  <p>• Shift starting soon (24h, 1h reminders)</p>
                  <p>• Timesheet submitted</p>
                  <p>• Payment processed</p>
                  <p>• Dispute filed</p>
                  <p>• New message received</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormData(settings)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={updateSettingsMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
