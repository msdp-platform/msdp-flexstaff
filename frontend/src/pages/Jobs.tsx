import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Job {
  id: string;
  title: string;
  description: string;
  industry: string;
  roleType: string;
  hourlyRate: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  locationName?: string;
  city?: string;
  status: string;
  durationType?: string;
  totalPositions: number;
  filledPositions: number;
}

export default function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shifts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = industryFilter
    ? jobs.filter((job) => job.industry === industryFilter)
    : jobs;

  const industries = Array.from(new Set(jobs.map((job) => job.industry)));

  const getDurationLabel = (type?: string) => {
    switch (type) {
      case 'quick':
        return 'Quick Job (1-4h)';
      case 'day':
        return 'Day Job (4-8h)';
      case 'multi_day':
        return 'Multi-day Project';
      default:
        return 'Standard';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
        {user?.role === 'employer' && (
          <button
            onClick={() => navigate('/jobs/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Post a Job
          </button>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="mb-6">
          <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Industry
          </label>
          <select
            id="industry-filter"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry.charAt(0).toUpperCase() + industry.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs available</h3>
          <p className="mt-2 text-gray-500">
            {industryFilter
              ? 'Try selecting a different industry filter'
              : 'Check back later for new opportunities'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    {job.durationType && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {getDurationLabel(job.durationType)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Industry:</span>
                      <p className="font-medium capitalize">{job.industry}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Role:</span>
                      <p className="font-medium">{job.roleType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{job.city || job.locationName || 'Remote'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">{new Date(job.shiftDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-2xl font-bold text-green-600">£{job.hourlyRate}/hr</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {job.startTime} - {job.endTime}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {job.filledPositions}/{job.totalPositions} positions filled
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
