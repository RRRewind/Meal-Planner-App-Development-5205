import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import Calendar from './pages/Calendar';
import ShoppingList from './pages/ShoppingList';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealPlanProvider } from './context/MealPlanContext';
import './App.css';

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl animate-pulse mx-auto mb-4 flex items-center justify-center">
        <div className="w-8 h-8 bg-white rounded-lg"></div>
      </div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// OAuth Callback Handler
const OAuthCallbackHandler = ({ children }) => {
  useEffect(() => {
    // Handle OAuth callback URL cleanup
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      // Check for OAuth parameters
      const hasOAuthParams = urlParams.has('code') || 
                            urlParams.has('access_token') || 
                            hashParams.has('access_token') || 
                            urlParams.has('error');

      if (hasOAuthParams) {
        console.log('🔗 OAuth callback detected, cleaning URL...');
        // Clean up the URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl + '#/');
        
        // Small delay to allow auth state to update
        setTimeout(() => {
          if (window.location.hash !== '#/') {
            window.location.hash = '#/';
          }
        }, 100);
      }
    };

    handleOAuthCallback();
  }, []);

  return children;
};

// Optimized page transitions with reduced motion for mobile
const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { 
    duration: 0.2, 
    ease: 'easeOut',
    type: 'tween'
  }
};

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, show landing page for root route
  if (!user) {
    return (
      <LazyMotion features={domAnimation}>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </LazyMotion>
    );
  }

  // If user is authenticated, show the main app
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 vercel-optimized">
        <Navigation />
        <main className="pt-20 pb-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route 
                path="/" 
                element={
                  <motion.div key="dashboard" {...pageTransition}>
                    <Dashboard />
                  </motion.div>
                } 
              />
              <Route 
                path="/recipes" 
                element={
                  <motion.div key="recipes" {...pageTransition}>
                    <Recipes />
                  </motion.div>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <motion.div key="calendar" {...pageTransition}>
                    <Calendar />
                  </motion.div>
                } 
              />
              <Route 
                path="/shopping" 
                element={
                  <motion.div key="shopping" {...pageTransition}>
                    <ShoppingList />
                  </motion.div>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </LazyMotion>
  );
};

function App() {
  return (
    <AuthProvider>
      <MealPlanProvider>
        <Router>
          <OAuthCallbackHandler>
            <AppRoutes />
          </OAuthCallbackHandler>
        </Router>
      </MealPlanProvider>
    </AuthProvider>
  );
}

export default App;