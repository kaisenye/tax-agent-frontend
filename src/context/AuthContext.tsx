import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { validateUser } from '../api/userAPI';

// Define the shape of our auth context
interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  userId: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  isLoading: false,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check localStorage on initial render and validate the stored user ID
  useEffect(() => {
    const validateStoredUser = async () => {
      setIsLoading(true);
      try {
        const storedUserId = localStorage.getItem('lucaUserId');
        if (storedUserId) {
          // Validate the user ID against the backend
          const userData = await validateUser(storedUserId);
          if (userData) {
            // User is valid, set authenticated state
            setUserId(storedUserId);
            setIsAuthenticated(true);
          } else {
            // User not found, clear localStorage
            localStorage.removeItem('lucaUserId');
            setError('User session expired. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Error validating stored user:', error);
        setError('Failed to validate user session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    validateStoredUser();
  }, []);

  // Login function that validates user ID and saves to localStorage if valid
  const login = async (newUserId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate the user ID against the backend
      const userData = await validateUser(newUserId);
      
      if (userData) {
        // User exists, save to localStorage and set authenticated state
        localStorage.setItem('lucaUserId', newUserId);
        setUserId(newUserId);
        setIsAuthenticated(true);
        return true;
      } else {
        // User doesn't exist, set error
        setError(`User ID not found. Please check and try again.`);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to authenticate. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function that removes userId from localStorage
  const logout = () => {
    localStorage.removeItem('lucaUserId');
    setUserId(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Provide the auth context to the component tree
  return (
    <AuthContext.Provider value={{ 
      userId, 
      isAuthenticated, 
      login, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 