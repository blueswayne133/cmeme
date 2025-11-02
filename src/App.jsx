// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import ActiveTradesPage from './pages/dashboard/user/ActiveTradesPage';
import P2PHistoryPage from './pages/dashboard/user/P2PHistoryPage';
import KycPage from './pages/dashboard/user/KycPage';
import AboutUsPage from './pages/dashboard/user/AboutUsPage';

// Admin Components
import AdminLogin from './pages/dashboard/admin/AdminLogin';
import AdminLayout from './pages/dashboard/admin/AdminLayout';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import UserManagement from './pages/dashboard/admin/UserManagement';
import UserDetail from './pages/dashboard/admin/UserDetail';
import KycManagement from './pages/dashboard/admin/KycManagement';
import TransactionManagement from './pages/dashboard/admin/TransactionManagement';
import AdminSettings from './pages/dashboard/admin/AdminSettings';
import AdminTaskManagement from './pages/dashboard/admin/AdminTaskManagement';
import DepositManagement from './pages/dashboard/admin/DepositManagement';
import ReferralManagement from './pages/dashboard/user/ReferralManagement';

const App = () => {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            style: {
              background: '#065f46',
              color: '#fff',
              border: '1px solid #047857',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#7f1d1d',
              color: '#fff',
              border: '1px solid #dc2626',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
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
          <Route path="p2p/active" element={<ActiveTradesPage />} />
          <Route path="p2p/history" element={<P2PHistoryPage />} />
          <Route path="kyc" element={<KycPage />} />
          <Route path="about" element={<AboutUsPage />} />
        </Route>

        {/* 👑 Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="kyc" element={<KycManagement />} />
          <Route path="deposits" element={<DepositManagement />} />
          <Route path="referrals" element={<ReferralManagement />} />
          <Route path= "tasks" element= {<AdminTaskManagement />}/>
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>


        {/* 🛑 Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;