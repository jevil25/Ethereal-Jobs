import { useState, useRef, useEffect, FC } from 'react';

interface DropdownProps {
    value: string;
    onChange: (value: string) => void;
    list: string[];
}

const Dropdown: FC<DropdownProps> = ({ value, list, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(list);
  const dropdownRef = useRef(null);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm === '') {
        setFilteredCountries(list);
    } else {
        const filtered = list.filter(country => 
            country.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
            return setFilteredCountries(filtered);
        }
        const includes = list.filter(country =>
            country.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (includes.length > 0) {
            return setFilteredCountries(includes);
        }
        const noMatches = ['No matches'];
        setFilteredCountries(noMatches);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      if (dropdownRef.current) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Select a country"}</span>
        <svg className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul>
            {filteredCountries.map(country => (
              <li 
                key={country} 
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => handleSelect(country)}
              >
                {country}
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-4 py-2 text-gray-500">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;