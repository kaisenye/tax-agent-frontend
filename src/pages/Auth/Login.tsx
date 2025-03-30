import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, error: authError, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!userId.trim()) {
      setLocalError('User ID is required');
      return;
    }
    
    // Simple validation - in a real app, you might want to add more complex validation
    if (userId.length < 3) {
      setLocalError('User ID must be at least 3 characters');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Login with the provided userId and wait for the result
      const success = await login(userId);
      
      if (success) {
        // Only redirect if login was successful
        navigate('/research');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display either local validation errors or auth service errors
  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-light">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-64">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="w-24 h-auto" />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-gray-700 text-lg font-bold mb-2">
              Enter your User ID
            </label>
            <input
              type="text"
              id="userId"
              className="border border-gray-dark rounded w-full py-2 px-3 text-lg text-black-light focus:outline-none focus:border-orange transition-all duration-150"
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-black-light hover:bg-black text-base text-white font-bold py-2 px-4 rounded w-full transition-colors duration-150"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </div>
        </form>

        {displayError && (
          <div className="bg-red-100 border border-red-400 text-base text-red px-2 py-1 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{displayError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 