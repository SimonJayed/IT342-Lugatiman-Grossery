import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GroceryItemsPage from './pages/GroceryItemsPage';
import ConsumptionLogPage from './pages/ConsumptionLogPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/items",
    element: (
      <ProtectedRoute>
        <GroceryItemsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/consumption",
    element: (
      <ProtectedRoute>
        <ConsumptionLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/expiry",
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  console.log("App Rendering");
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
