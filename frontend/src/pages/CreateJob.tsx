import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { shiftService } from '../services/api';

interface JobFormData {
  title: string;
  description: string;
  industry: string;
  roleType: string;
  durationType: string;
  locationName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  totalPositions: number;
  requirements?: string;
}

export default function CreateJob() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<JobFormData>();

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      await shiftService.createShift(data);
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mt-2">Fill in the details to post a new job</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Plumber for Emergency Repair"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the job responsibilities and expectations..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <select
                {...register('industry', { required: 'Industry is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select industry</option>
                <optgroup label="Service Industries">
                  <option value="hospitality">Hospitality</option>
                  <option value="retail">Retail</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="events">Events</option>
                  <option value="office">Office</option>
                  <option value="security">Security</option>
                </optgroup>
                <optgroup label="Skilled Trades">
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="painting">Painting & Decorating</option>
                  <option value="hvac">HVAC (Heating & Cooling)</option>
                  <option value="construction">Construction</option>
                </optgroup>
                <optgroup label="Home Services">
                  <option value="cleaning">Cleaning</option>
                  <option value="gardening">Gardening & Landscaping</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="logistics">Logistics</option>
                  <option value="other">Other</option>
                </optgroup>
              </select>
              {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Type *
              </label>
              <input
                {...register('roleType', { required: 'Role type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Plumber, Electrician, Cleaner"
              />
              {errors.roleType && <p className="text-red-500 text-sm mt-1">{errors.roleType.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Duration Type *
            </label>
            <select
              {...register('durationType', { required: 'Duration type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select duration type</option>
              <option value="quick">Quick Job (1-4 hours) - Small tasks</option>
              <option value="day">Day Job (4-8 hours) - Standard booking</option>
              <option value="multi_day">Multi-day Project (2+ days) - Extended projects</option>
            </select>
            {errors.durationType && <p className="text-red-500 text-sm mt-1">{errors.durationType.message}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Select the expected duration to help workers understand the commitment level
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Location</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name *
            </label>
            <input
              {...register('locationName', { required: 'Location name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Grand Hotel London"
            />
            {errors.locationName && <p className="text-red-500 text-sm mt-1">{errors.locationName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              {...register('addressLine1', { required: 'Address is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Street address"
            />
            {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              {...register('addressLine2')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode *
              </label>
              <input
                {...register('postcode', { required: 'Postcode is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., SW1A 1AA"
              />
              {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode.message}</p>}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                {...register('shiftDate', { required: 'Date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.shiftDate && <p className="text-red-500 text-sm mt-1">{errors.shiftDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                {...register('startTime', { required: 'Start time is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                {...register('endTime', { required: 'End time is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate (£) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('hourlyRate', {
                  required: 'Hourly rate is required',
                  min: { value: 0, message: 'Rate must be positive' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 12.50"
              />
              {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Positions *
              </label>
              <input
                type="number"
                {...register('totalPositions', {
                  required: 'Number of positions is required',
                  min: { value: 1, message: 'At least 1 position required' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5"
              />
              {errors.totalPositions && <p className="text-red-500 text-sm mt-1">{errors.totalPositions.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              {...register('requirements')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any specific requirements, certifications, or experience needed..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
