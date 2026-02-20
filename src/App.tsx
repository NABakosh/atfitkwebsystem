import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentsProvider } from './context/StudentsContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentFormPage } from './pages/StudentFormPage';
import { StudentCardPage } from './pages/StudentCardPage';

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Navbar />
      <main>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id" element={<StudentCardPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <StudentsProvider>
            <AppRoutes />
          </StudentsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
