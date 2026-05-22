import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/auth/ProfilePage';
import GroceryItemsPage from './features/grocery/GroceryItemsPage';
import ConsumptionLogPage from './features/consumption/ConsumptionLogPage';
import MarketPricePage from './features/dashboard/MarketPricePage';
import ExpiryPage from './features/dashboard/ExpiryPage';
import ProtectedRoute from './features/auth/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './features/auth/AuthContext';

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
    path: "/market",
    element: (
      <ProtectedRoute>
        <MarketPricePage />
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
    element: (
      <ProtectedRoute>
        <ExpiryPage />
      </ProtectedRoute>
    ),
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
