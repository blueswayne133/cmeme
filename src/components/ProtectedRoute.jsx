// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { getToken, getUserFromLocalStorage } from '../utils/localStorage';

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const user = getUserFromLocalStorage();
  
  return token && user ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;