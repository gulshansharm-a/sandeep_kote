import React from 'react';
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS styles

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Loading Spinner */}
      <div className="inline-block animate-spin rounded-full border-t-4 border-gray-900 border-t-gray-100 h-16 w-16"></div>
    </div>
  );
};

export default LoadingSpinner;
