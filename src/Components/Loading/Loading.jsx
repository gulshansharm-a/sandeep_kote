// Loading.js
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-4xl font-semibold">
        Loading...
      </div>
      <div className="ml-4 border-t-4 border-white border-solid rounded-full animate-spin w-8 h-8"></div>
    </div>
  );
};


export default LoadingSpinner;
