import React from 'react';

interface ThemeInputProps {
  theme: string;
  setTheme: (theme: string) => void;
  isLoading: boolean;
}

export const ThemeInput: React.FC<ThemeInputProps> = ({ theme, setTheme, isLoading }) => {
  return (
    <div className="mb-4">
      <label htmlFor="mapTheme" className="block text-sm font-medium text-slate-300 mb-1">
        Describe Your Map's Theme
      </label>
      <textarea
        id="mapTheme"
        name="mapTheme"
        rows={3}
        className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:opacity-70"
        placeholder="e.g., A mystical forest kingdom under an eternal twilight, haunted by ancient spirits."
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        disabled={isLoading}
        aria-describedby="theme-description"
      />
      <p id="theme-description" className="mt-1 text-xs text-slate-400">
        Be descriptive! The more detail, the better the AI can visualize your map.
      </p>
    </div>
  );
};
