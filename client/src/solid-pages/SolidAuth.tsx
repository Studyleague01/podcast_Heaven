import { createSignal, Show } from 'solid-js';
import { loginUser, registerUser, AuthResponse } from '../api/auth';

type FormMode = 'login' | 'register';

type SolidAuthProps = {
  onLogin?: (email: string, name?: string) => void;
};

export function SolidAuth(props: SolidAuthProps = {}) {
  // Form state
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [name, setName] = createSignal('');
  const [phone, setPhone] = createSignal('');
  const [mode, setMode] = createSignal<FormMode>('login');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal('');
  
  // Toggle between login and register forms
  const toggleMode = () => {
    setMode(mode() === 'login' ? 'register' : 'login');
    setError(''); // Clear errors when switching modes
  };
  
  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      let response: AuthResponse;
      
      if (mode() === 'login') {
        if (!email() || !password()) {
          setError('Please enter your email and password');
          setLoading(false);
          return;
        }
        
        response = await loginUser(email(), password());
      } else {
        if (!email() || !password() || !name()) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        
        response = await registerUser(email(), password(), name(), phone());
      }
      
      if (response.success) {
        if (mode() === 'register') {
          setSuccess('Registration successful! You can now login.');
          setMode('login');
          setEmail('');
          setPassword('');
        } else {
          // Login successful - call parent handler
          setSuccess('Login successful!');
          
          // Call the parent's onLogin handler if provided
          if (props.onLogin) {
            props.onLogin(email(), response.name);
          }
        }
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-700">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mode() === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mode() === 'login' 
                ? 'Sign in to access your podcasts' 
                : 'Join to start listening to podcasts'}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
            
            {/* Password field */}
            <div className="mb-4">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            {/* Register-only fields */}
            <Show when={mode() === 'register'}>
              <div className="mb-4">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone()}
                  onInput={(e) => setPhone(e.currentTarget.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Your phone number"
                />
              </div>
            </Show>
            
            {/* Error and success messages */}
            <Show when={error()}>
              <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md text-sm">
                {error()}
              </div>
            </Show>
            
            <Show when={success()}>
              <div className="mb-4 p-3 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-md text-sm">
                {success()}
              </div>
            </Show>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={loading()}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading() 
                ? 'Processing...' 
                : mode() === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          {/* Toggle mode link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              {mode() === 'login' 
                ? 'Need an account? Sign up' 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}