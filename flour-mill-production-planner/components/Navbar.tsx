import React from 'react';
import SettingsIcon from './icons/SettingsIcon';

interface NavbarProps {
  onOpenSettings: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-2xl text-brand-primary">
              Flour Mill Production Planner
            </span>
          </div>
          <div className="flex items-center">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-gray-500 hover:text-brand-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
