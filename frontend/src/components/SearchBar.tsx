import React, { useState } from 'react';
import { getCode, getNames } from 'country-list';
import Dropdown from './DropDown';

interface SearchBarProps {
  onSearch: (params: {
    city: string;
    country_code: string;
    country: string;
    job_title: string;
    recruiters: string;
  }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const countries = getNames();

  const [city, setCity] = useState('Bengaluru');
  const [country, setCountry] = useState('India');
  const [jobTitle, setJobTitle] = useState('Software Developer');

  const handleSubmit = (e: React.FormEvent) => {
    const countryCode = getCode(country.toLowerCase());
    const recruiters = '';
    e.preventDefault();
    onSearch({
      city,
      country_code: countryCode? countryCode : 'IN',
      country,
      job_title: jobTitle,
      recruiters,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Software Developer"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <Dropdown
            value={country}
            list={countries}
            onChange={setCountry}
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Bengaluru"
          />
        </div>
        
        {/* <div>
          <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
            Country Code
          </label>
          <input
            id="countryCode"
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. IN"
            maxLength={2}
          />
        </div> */}
        
        {/* <div>
          <label htmlFor="recruiters" className="block text-sm font-medium text-gray-700 mb-1">
            Recruiters
          </label>
          <input
            id="recruiters"
            type="text"
            value={recruiters}
            onChange={(e) => setRecruiters(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. BuziBrains"
          />
        </div> */}
        
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
          >
            Search Jobs
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;