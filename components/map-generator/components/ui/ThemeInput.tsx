
import React from 'react';

interface ThemeInputProps {
  theme: string;
  setTheme: (theme: string) => void;
  isLoading: boolean;
}

export const ThemeInput: React.FC<ThemeInputProps> = ({ theme, setTheme, isLoading }) => {
  return (
    <div className="mb-4">
      <label htmlFor="mapTheme" className="block text-sm font-medium text-stone-700 mb-1">
        Describe Your Map's Theme
      </label>
      <textarea
        id="mapTheme"
        name="mapTheme"
        rows={3}
        className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white disabled:bg-stone-100 disabled:text-stone-500 placeholder-stone-400"
        placeholder="e.g., A mystical forest kingdom under an eternal twilight, haunted by ancient spirits."
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        disabled={isLoading}
        aria-describedby="theme-description"
      />
      <p id="theme-description" className="mt-1 text-xs text-stone-500">
        Be descriptive! The more detail, the better the AI can visualize your map.
      </p>
    </div>
  );
};
