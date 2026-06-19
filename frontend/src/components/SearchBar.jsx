import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api/client';

export default function SearchBar({ initialQuery = '', large = false, onSearch }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchApi.autocomplete(value);
        setSuggestions(data.data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const stackOnMobile = 'flex-col sm:flex-row';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className={`flex gap-2 ${stackOnMobile}`}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search indexed pages…"
          className={`input-field flex-1 min-w-0 ${large ? 'py-3 sm:py-3.5 text-[15px] rounded-xl' : ''}`}
          aria-label="Search query"
        />
        <button
          type="submit"
          className={`btn-primary flex-shrink-0 w-full sm:w-auto ${large ? 'sm:px-6 py-3 rounded-xl' : ''}`}
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 card overflow-hidden max-h-52 overflow-y-auto py-1 left-0 right-0">
          {suggestions.map((s) => (
            <li key={s.term}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(s.term)}
                className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-surface dark:hover:bg-surface-dark-hover transition-colors flex justify-between gap-3 min-h-[44px] items-center"
              >
                <span className="text-ink dark:text-ink-dark truncate">{s.term}</span>
                <span className="text-xs text-ink-faint tabular-nums flex-shrink-0">{s.documentFrequency}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
