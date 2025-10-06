import { useParams } from 'react-router-dom';

export default function JobDetail() {
  const { id } = useParams();

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Detail</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">Loading job {id}...</p>
      </div>
    </div>
  );
}
