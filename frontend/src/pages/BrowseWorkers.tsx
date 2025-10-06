import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AvailableWorker {
  id: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  hourlyRate?: number;
  notes?: string;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    bio?: string;
    hourlyRateMin?: number;
    user: {
      email: string;
      phoneNumber?: string;
    };
  };
}

export default function BrowseWorkers() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<AvailableWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchAvailableWorkers();
  }, [filterDate]);

  const fetchAvailableWorkers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/available-workers?${params}`
      );

      if (!response.ok) throw new Error('Failed to fetch available workers');

      const data = await response.json();
      setWorkers(data);
    } catch (error) {
      console.error('Error fetching available workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId: string) => {
    // Check if user is logged in and is an employer
    if (!isAuthenticated) {
      if (confirm('Please login to book a worker. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }

    if (user?.role !== 'employer') {
      alert('Only employers can book workers. Please login with an employer account.');
      return;
    }

    if (!confirm('Are you sure you want to book this worker?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/availability/${slotId}/book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Failed to book worker');
        return;
      }

      alert('Worker booked successfully! Both you and the worker will receive invitation notifications.');
      fetchAvailableWorkers();
    } catch (error) {
      console.error('Error booking worker:', error);
      alert('Failed to book worker');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading available workers...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Available Workers</h1>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No available workers</h3>
          <p className="mt-2 text-gray-500">
            {filterDate
              ? 'Try selecting a different date'
              : 'There are no workers available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {workers.map((slot) => (
            <div key={slot.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {slot.worker.firstName[0]}
                        {slot.worker.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {slot.worker.firstName} {slot.worker.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{slot.worker.user.email}</p>
                    </div>
                  </div>

                  {slot.worker.bio && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{slot.worker.bio}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">
                        {new Date(slot.availabilityDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <p className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hourly Rate:</span>
                      <p className="font-medium text-green-600">
                        £{slot.hourlyRate || slot.worker.hourlyRateMin || 'N/A'}/hr
                      </p>
                    </div>
                    {slot.worker.user.phoneNumber && (
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{slot.worker.user.phoneNumber}</p>
                      </div>
                    )}
                  </div>

                  {slot.notes && (
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <span className="font-medium text-gray-700">Notes: </span>
                      <span className="text-gray-600">{slot.notes}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBook(slot.id)}
                  className="ml-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
