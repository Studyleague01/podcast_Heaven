import { createSignal, Show } from 'solid-js';

type SolidHeaderProps = {
  isAuthPage?: boolean;
};

export function SolidHeader(props: SolidHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen());
  };

  return (
    <Show when={!props.isAuthPage}>
      <header class="py-4 px-4 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center justify-between shadow-md">
        <div class="flex items-center">
          <a href="/" class="text-xl font-bold text-white flex items-center">
            <span class="material-icons mr-2">music_note</span>
            <span>Crypt<span class="opacity-90">une</span></span>
          </a>
        </div>
        
        <div class="flex items-center space-x-4">
          <a href="/search" class="p-2 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors">
            <span class="material-icons">search</span>
          </a>

          <button 
            class="p-2 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors"
            onClick={toggleMenu}
          >
            <span class="material-icons">person</span>
          </button>
          
          {/* Simple dropdown menu */}
          <Show when={isMenuOpen()}>
            <div class="absolute right-4 top-14 bg-white dark:bg-zinc-800 shadow-lg rounded-lg z-50 w-48 py-2">
              <a href="/profile" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700">Profile</a>
              <a href="/settings" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700">Settings</a>
              <a href="/auth" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-red-500">Logout</a>
            </div>
          </Show>
        </div>
      </header>
    </Show>
  );
}