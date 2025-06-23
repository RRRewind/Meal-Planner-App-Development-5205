import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, show landing page for root route
  if (!user) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/*" element={<Navigate to="/landing" replace />} />
      </Routes>
    );
  }

  // If user is authenticated, show the main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Navigation />
      <main className="pt-20 pb-8">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/" element={
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            } />
            <Route path="/recipes" element={
              <motion.div
                key="recipes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Recipes />
              </motion.div>
            } />
            <Route path="/calendar" element={
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Calendar />
              </motion.div>
            } />
            <Route path="/shopping" element={
              <motion.div
                key="shopping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingList />
              </motion.div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MealPlanProvider>
        <Router>
          <AppRoutes />
        </Router>
      </MealPlanProvider>
    </AuthProvider>
  );
}

export default App;