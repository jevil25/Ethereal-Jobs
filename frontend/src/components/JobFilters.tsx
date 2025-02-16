import React from 'react';

interface FiltersProps {
  filters: {
    is_remote: boolean;
    job_type: string;
    salary_min: number;
    salary_max: number;
  };
  onChange: (filters: any) => void;
}

const JobFilters: React.FC<FiltersProps> = ({ filters, onChange }) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.is_remote}
            onChange={(e) => onChange({ is_remote: e.target.checked })}
            className="rounded text-blue-500 focus:ring-blue-500"
          />
          <span>Remote Only</span>
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Type
        </label>
        <select
          value={filters.job_type}
          onChange={(e) => onChange({ job_type: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          {jobTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Salary Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.salary_min || ''}
            onChange={(e) => onChange({ salary_min: Number(e.target.value) })}
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.salary_max || ''}
            onChange={(e) => onChange({ salary_max: Number(e.target.value) })}
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <button
        onClick={() => onChange({
          is_remote: false,
          job_type: '',
          salary_min: 0,
          salary_max: 0,
          currency: ''
        })}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition duration-200"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default JobFilters;