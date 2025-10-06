import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface DashboardStats {
  totalJobs: number;
  activeApplications: number;
  earnings: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeApplications: 0,
    earnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch jobs count
      const jobsResponse = await fetch(`${import.meta.env.VITE_API_URL}/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobs = jobsResponse.ok ? await jobsResponse.json() : [];

      // Fetch applications count
      const applicationsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const applications = applicationsResponse.ok ? await applicationsResponse.json() : [];

      // Calculate active applications (pending or accepted)
      const activeApps = Array.isArray(applications)
        ? applications.filter(
            (app: any) => app.status === 'pending' || app.status === 'accepted'
          ).length
        : 0;

      setStats({
        totalJobs: Array.isArray(jobs) ? jobs.length : 0,
        activeApplications: activeApps,
        earnings: 0, // TODO: Implement earnings calculation
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome, {user?.email}
      </h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                {user?.role === 'employer' ? 'My Jobs' : 'Available Jobs'}
              </h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalJobs}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Applications</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.activeApplications}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                {user?.role === 'employer' ? 'Total Spend' : 'Earnings This Week'}
              </h3>
              <p className="text-3xl font-bold text-primary-600">£{stats.earnings}</p>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {user?.role === 'employer' ? (
                <>
                  <button
                    onClick={() => navigate('/jobs/new')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Post a New Job
                  </button>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                  >
                    View My Jobs
                  </button>
                  <button
                    onClick={() => navigate('/team')}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                  >
                    My Team
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Browse Available Jobs
                  </button>
                  <button
                    onClick={() => navigate('/team')}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                  >
                    My Team
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
