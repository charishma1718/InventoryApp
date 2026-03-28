import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { CartProvider, useCart } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import MetricsPage from './pages/MetricsPage';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/dashboard.css';

// Header component that uses auth context
function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <span>📦 Inventory Dashboard</span>
          {isAuthenticated && user && (
            <span className="user-badge">{user.role.toUpperCase()}</span>
          )}
        </div>
        {isAuthenticated && user ? (
          <nav className="header-nav">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'active' : '')}
              aria-label="Dashboard"
            >
              Dashboard
            </NavLink>
            {['staff', 'manager'].includes(user.role) && (
              <NavLink
                to="/items"
                className={({ isActive }) => (isActive ? 'active' : '')}
                aria-label="Items"
              >
                Items
              </NavLink>
            )}
            {user.role === 'manager' && (
              <NavLink
                to="/metrics"
                className={({ isActive }) => (isActive ? 'active' : '')}
                aria-label="Metrics"
              >
                Metrics
              </NavLink>
            )}
            {user.role === 'user' && (
              <NavLink
                to="/cart"
                className={({ isActive }) => (isActive ? 'active' : '')}
                aria-label="Shopping Cart"
              >
                🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
            )}
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button
                className="btn btn-secondary"
                onClick={logout}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </nav>
        ) : (
          <nav className="header-nav">
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'active' : '')}
              aria-label="Login"
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) => (isActive ? 'active' : '')}
              aria-label="Sign up"
            >
              Sign Up
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

// Main app routes
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Signup />
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <InventoryProvider>
              <DashboardPage />
            </InventoryProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute requiredRoles={['staff', 'manager']}>
            <InventoryProvider>
              <ItemsPage />
            </InventoryProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/metrics"
        element={
          <ProtectedRoute requiredRoles={['manager']}>
            <InventoryProvider>
              <MetricsPage />
            </InventoryProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute requiredRoles={['user']}>
            <InventoryProvider>
              <Cart />
            </InventoryProvider>
          </ProtectedRoute>
        }
      />

      {/* 404 route */}
      <Route
        path="*"
        element={
          <div className="page-container">
            <h1>404 - Page Not Found</h1>
            <p>
              The page you are looking for doesn't exist.{' '}
              <NavLink to="/">Go back to dashboard</NavLink>
            </p>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="app-container">
              <AppHeader />
              <main className="app-main">
                <AppRoutes />
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
