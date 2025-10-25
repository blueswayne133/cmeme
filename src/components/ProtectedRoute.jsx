// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();

  if (adminOnly) {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!adminToken || !adminData) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    return children;
  } else {
    // Check user authentication
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    return children;
  }
};

export default ProtectedRoute;