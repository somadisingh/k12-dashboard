import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading..." />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
