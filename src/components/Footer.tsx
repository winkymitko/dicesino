// project/src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs text-gray-500">
        <span>© {new Date().getFullYear()} Dicesino</span>
        <span>House edge applies. Play responsibly.</span>
      </div>
    </footer>
  );
};

export default Footer;
