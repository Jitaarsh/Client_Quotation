import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const StatusDropdown = ({ currentStatus, onStatusChange, getStatusColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statuses = [
    { value: 'OPEN', label: 'OPEN' },
    { value: 'IN PROGRESS', label: 'IN PROGRESS' },
    { value: 'RESOLVED', label: 'RESOLVED' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all shadow-sm border border-transparent hover:border-current/10 ${getStatusColor(currentStatus)}`}
      >
        <span>{currentStatus}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 lg:right-0 lg:left-auto mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                onStatusChange(status.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                currentStatus === status.value ? 'text-[#145be9]' : 'text-gray-500'
              }`}
            >
              {status.label}
              {currentStatus === status.value && (
                <Check className="w-3.5 h-3.5 text-[#145be9]" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
