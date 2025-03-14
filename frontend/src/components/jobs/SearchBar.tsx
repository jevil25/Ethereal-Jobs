import React, { useState, useEffect } from "react";
import { getCode, getNames } from "country-list";
import { useSearchParams } from "react-router-dom";
import { getSearchSuggestions, getLocationSuggestions } from "../../api/jobs";
import { SuggestionsBox } from "./suggestionsBox";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

  const [searchParams] = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [jobTitle, setJobTitle] = useState(searchParams.get("job_title") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Handle initial load from search params
  useEffect(() => {
    if (
      !initialLoadDone &&
      searchParams.get("city") &&
      searchParams.get("country") &&
      searchParams.get("job_title")
    ) {
      const countryCode = getCode(
        country
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      );
      onSearch({
        city,
        country_code: countryCode ? countryCode : "IN",
        country,
        job_title: jobTitle,
        recruiters: "",
        job_type: filters.job_type,
      });
      setInitialLoadDone(true);
    }
  });

  // Handle filter changes only - separate from form submission
  useEffect(() => {
    if (initialLoadDone && city && country && jobTitle) {
      const countryCode = getCode(
        country
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      );
      onSearch({
        city,
        country_code: countryCode ? countryCode : "IN",
        country,
        job_title: jobTitle,
        recruiters: "",
        job_type: filters.job_type,
      });
    }
  }, [filters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !country || !jobTitle) {
      return;
    }

    const countryCode = getCode(
      country
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    );
    onSearch({
      city,
      country_code: countryCode ? countryCode : "IN",
      country,
      job_title: jobTitle,
      recruiters: "",
      job_type: filters.job_type,
    });
    setInitialLoadDone(true);
  };

  const handleSearchText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
    if (e.target.value.length > 0) {
      const query = {
        query: e.target.value,
      };
      const suggestionsResponse = await getSearchSuggestions(query);
      setSuggestions(
        suggestionsResponse.suggestions.map(
          (suggestion) => suggestion.suggestion,
        ),
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLocationSearchText = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updateCounty = country
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const countryCode = getCode(updateCounty);
    setCity(e.target.value);
    if (e.target.value.length > 0) {
      const query = {
        query: e.target.value,
        country: countryCode ? countryCode : "IN",
      };
      const suggestionsResponse = await getLocationSuggestions(query);
      setLocationSuggestions(
        suggestionsResponse.suggestions.map(
          (suggestion) => suggestion.suggestion,
        ),
      );
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  useEffect(() => {
    const closeSuggestions = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest("#jobTitle") &&
        !(e.target as HTMLElement).closest("#city")
      ) {
        setShowSuggestions(false);
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("click", closeSuggestions);
    return () => {
      document.removeEventListener("click", closeSuggestions);
    };
  }, []);

  return (
    <Card className="shadow-md border-0">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative space-y-2">
              <Label
                htmlFor="jobTitle"
                className="text-sm font-medium text-gray-700"
              >
                Job Title
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={handleSearchText}
                placeholder="e.g. Software Developer"
                autoComplete="off"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {showSuggestions && (
                <SuggestionsBox
                  suggestions={suggestions}
                  setSuggestion={setJobTitle}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-gray-700"
              >
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger
                  id="country"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {countries.map((countryName) => (
                    <SelectItem key={countryName} value={countryName}>
                      {countryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-700"
              >
                City
              </Label>
              <Input
                id="city"
                value={city}
                onChange={handleLocationSearchText}
                placeholder="e.g. Bengaluru"
                autoComplete="off"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {showLocationSuggestions && (
                <SuggestionsBox
                  suggestions={locationSuggestions}
                  setSuggestion={setCity}
                />
              )}
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              variant="jobify"
              className="w-full py-2 px-4 rounded-md transition duration-200"
            >
              Search Jobs
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchBar;
