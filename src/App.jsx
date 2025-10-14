// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/dashboard/user/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardContent from './pages/dashboard/user/DashboardContent';
import ProfilePage from './pages/dashboard/user/ProfilePage';
import TransactionHistory from './pages/dashboard/user/TransactionHistory';
import TasksPage from './pages/dashboard/user/TasksPage';
import ReferralsPage from './pages/dashboard/user/ReferralsPage';
import LeaderboardPage from './pages/dashboard/user/LeaderboardPage';
import WalletPage from './pages/dashboard/user/WalletPage';
import P2PTradePage from './pages/dashboard/user/P2PTradePage';
import KycPage from './pages/dashboard/user/KycPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* 🔒 Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardContent />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="p2p" element={<P2PTradePage />} />
           <Route path="kyc" element={<KycPage />} />
        </Route>

        {/* 🛑 Fallback route for undefined paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
