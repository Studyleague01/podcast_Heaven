import React from 'react';

const OfflineFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-zinc-900">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <span className="material-icons text-6xl text-orange-500">wifi_off</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800 dark:text-gray-100">
          You're Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          It seems like you're not connected to the internet. Check your connection and try again.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm">
          Don't worry, your cached podcasts are still available.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mt-12 pt-12 border-t border-gray-200 dark:border-zinc-700 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Cached Content</h2>
        
        <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">
            We're working on showing your cached content here when you're offline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;