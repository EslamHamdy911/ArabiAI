import React from 'react';
import { Theme } from '../types';
import { Sun, Moon, Star } from 'lucide-react';

interface Props {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  lang: 'ar' | 'en';
}

export const ThemeSwitcher: React.FC<Props> = ({ currentTheme, onThemeChange, lang }) => {
  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      <button
        onClick={() => onThemeChange('light')}
        className={`p-2 rounded-md transition-all ${currentTheme === 'light' ? 'bg-white shadow text-yellow-500' : 'text-gray-500'}`}
        title={lang === 'ar' ? 'فاتح' : 'Light'}
      >
        <Sun size={18} />
      </button>
      <button
        onClick={() => onThemeChange('dark')}
        className={`p-2 rounded-md transition-all ${currentTheme === 'dark' ? 'bg-gray-700 shadow text-blue-400' : 'text-gray-500'}`}
        title={lang === 'ar' ? 'داكن' : 'Dark'}
      >
        <Moon size={18} />
      </button>
      <button
        onClick={() => onThemeChange('midnight')}
        className={`p-2 rounded-md transition-all ${currentTheme === 'midnight' ? 'bg-indigo-900 shadow text-indigo-300' : 'text-gray-500'}`}
        title={lang === 'ar' ? 'ليلي' : 'Midnight'}
      >
        <Star size={18} />
      </button>
    </div>
  );
};