import React, { useState, useEffect } from 'react';

// Define the structure of the BeforeInstallPromptEvent since it's not in TypeScript's standard lib
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Declare the event on the window for TypeScript
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const InstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Check if the app is already installed
  useEffect(() => {
    // Check if app is in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                        || (window.navigator as any).standalone 
                        || document.referrer.includes('android-app://');
                        
    setIsInstalled(isStandalone);
    
    // Also listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('App was installed!');
      setIsInstalled(true);
      setShowPrompt(false);
    });
  }, []);

  useEffect(() => {
    // Don't show prompt if already installed
    if (isInstalled) {
      return;
    }
    
    console.log('Setting up beforeinstallprompt listener');
    
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      console.log('Before install prompt event fired!');
      
      // Store the event so it can be triggered later
      setInstallPromptEvent(e);
      
      // Show the prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return;
    }
    
    // Show the install prompt
    await installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;
    
    // We've used the prompt, no need to show it again
    setInstallPromptEvent(null);
    setShowPrompt(false);
    
    console.log(`User response to the install prompt: ${outcome}`);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-800 shadow-lg z-50 p-4 border-t border-gray-200 dark:border-zinc-700">
      <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <span className="material-icons text-orange-500 mr-3 text-xl">add_to_home_screen</span>
          <p className="text-gray-800 dark:text-gray-200">Install Cryptune on your device for quick access and offline use!</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleInstallClick}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors"
          >
            Install
          </button>
          <button 
            onClick={() => setShowPrompt(false)}
            className="px-5 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-full font-medium transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;