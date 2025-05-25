import React, { useState } from 'react';

export interface TagOption {
  label: string;
  value: string;
}

interface TagSelectorProps {
  options: TagOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
  label?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ options, selected, onChange, allowCustom = false, label }) => {
  const [input, setInput] = useState('');
  const [customError, setCustomError] = useState('');

  const handleTagClick = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(tag => tag !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCustomError('');
  };

  const handleAddCustomTag = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (selected.includes(trimmed) || options.some(opt => opt.value === trimmed)) {
      setCustomError('Tag already selected or exists.');
      return;
    }
    onChange([...selected, trimmed]);
    setInput('');
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <div className="flex flex-wrap gap-2 mb-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${selected.includes(opt.value) ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-700 text-slate-200 border-slate-500 hover:bg-purple-700 hover:text-white'}`}
            onClick={() => handleTagClick(opt.value)}
          >
            {opt.label}
          </button>
        ))}
        {selected.filter(sel => !options.some(opt => opt.value === sel)).map(custom => (
          <span key={custom} className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white border border-green-400 mr-1">
            {custom}
          </span>
        ))}
      </div>
      {allowCustom && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            className="p-1 px-2 rounded-md border border-slate-500 bg-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-purple-400"
            placeholder="Add custom tag"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
          />
          <button
            type="button"
            className="px-2 py-1 text-xs rounded-md bg-purple-700 text-white border border-purple-400 hover:bg-purple-800"
            onClick={handleAddCustomTag}
          >
            Add
          </button>
          {customError && <span className="text-xs text-red-400 ml-2">{customError}</span>}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
