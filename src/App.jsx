import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/dashboard/user/Dashboard'; 

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🌍 Public Route */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
};

export default App;