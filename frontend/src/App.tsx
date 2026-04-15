import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import Navbar from './components/shared/Navbar';
import BottomNav from './components/shared/BottomNav';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/citizen/Dashboard';
import ReportLeak from './pages/citizen/ReportLeak';
import Leaderboard from './pages/citizen/Leaderboard';
import Profile from './pages/citizen/Profile';
import AuthorityDashboard from './pages/authority/Dashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role && user?.role !== 'ADMIN') {
    return <Navigate to={user?.role === 'AUTHORITY' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col pt-16 pb-20 md:pb-0">
        <Navbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Citizen Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute role="CITIZEN">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report" 
              element={
                <ProtectedRoute role="CITIZEN">
                  <ReportLeak />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute role="CITIZEN">
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute role="CITIZEN">
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Authority/Admin Routes */}
            <Route 
              path="/authority" 
              element={
                <ProtectedRoute role="AUTHORITY">
                  <AuthorityDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute role="AUTHORITY">
                  <AuthorityDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        {/* Mobile bottom navigation for Citizens */}
        {user?.role === 'CITIZEN' && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;
