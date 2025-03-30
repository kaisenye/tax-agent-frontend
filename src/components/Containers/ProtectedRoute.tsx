import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-light">
        <LoadingSpinner size="large" className="mb-4" />
        <p className="text-black-light">Verifying your session...</p>
      </div>
    );
  }

  // If authentication failed with an error, redirect to login with error message
  if (error) {
    return <Navigate to="/login" replace />;
  }

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 