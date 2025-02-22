import React, { useState, useEffect } from 'react';
import { getCode, getNames } from 'country-list';
import Dropdown from './DropDown';
import { useSearchParams } from 'react-router-dom';
import { getSearchSuggestions, getLocationSuggestions } from '../api/jobs';
import { SuggestionsBox } from './suggestionsBox';

interface SearchBarProps {
  onSearch: (params: {
    city: string;
    country_code: string;
    country: string;
    job_title: string;
    recruiters: string;
    job_type: string;
  }) => void;
  filters: {  
    is_remote: boolean;
    job_type: string;
    salary_min: number;
    salary_max: number;
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, filters }) => {
  const countries = getNames();

  const [searchParams, _] = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [jobTitle, setJobTitle] = useState(searchParams.get('job_title') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    const countryCode = getCode(country.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    const recruiters = '';
    e.preventDefault();
    onSearch({
      city,
      country_code: countryCode? countryCode : 'IN',
      country,
      job_title: jobTitle,
      recruiters,
      job_type: filters.job_type,
    });
  };

  useEffect(() => {
    const countryCode = getCode(country.toLowerCase());
    const recruiters = '';
    onSearch({
      city,
      country_code: countryCode? countryCode : 'IN',
      country,
      job_title: jobTitle,
      recruiters,
      job_type: filters.job_type,
    });
  }
  , [filters]);

  const handleSearchText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
    if (e.target.value.length > 0) {
      const query = {
        query: e.target.value,
      }
      const suggestionsResponse = await getSearchSuggestions(query);
      setSuggestions(suggestionsResponse.suggestions.map(suggestion => suggestion.suggestion));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLocationSearchText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const updateCounty = country.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const countryCode = getCode(updateCounty);
    setCity(e.target.value);
    if (e.target.value.length > 0) {
      const query = {
        query: e.target.value,
        country: countryCode ? countryCode : 'IN',
      }
      const suggestionsResponse = await getLocationSuggestions(query);
      setLocationSuggestions(suggestionsResponse.suggestions.map(suggestion => suggestion.suggestion));
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  }

  useEffect(() => {
    const closeSuggestions = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#jobTitle')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', closeSuggestions);
    return () => {
      document.removeEventListener('click', closeSuggestions);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => handleSearchText(e)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Software Developer"
          />
          {showSuggestions && (
            <SuggestionsBox suggestions={suggestions} setSuggestion={setJobTitle} />
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <Dropdown
            value={country}
            list={countries}
            onChange={setCountry}
            selectionText="Select a country"
            noSelectionText='No Country Selected'
          />
        </div>
        
        <div className='relative'>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => handleLocationSearchText(e)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Bengaluru"
          />
          {showLocationSuggestions && (
            <SuggestionsBox suggestions={locationSuggestions} setSuggestion={setCity} />
          )}
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