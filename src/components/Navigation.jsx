import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

const { FiHome, FiBook, FiCalendar, FiShoppingCart, FiLogIn } = FiIcons;

const Navigation = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/recipes', icon: FiBook, label: 'Recipes' },
    { path: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { path: '/shopping', icon: FiShoppingCart, label: 'Shopping' }
  ];

  // Simplified mobile motion - keep original styling but reduce motion complexity
  const getButtonProps = () => {
    if (isMobile) {
      return {
        whileTap: { scale: 0.98 },
        transition: { duration: 0.1 }
      };
    }
    return {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { duration: 0.15 }
    };
  };

  const getLogoProps = () => {
    if (isMobile) {
      return {};
    }
    return {
      whileHover: { rotate: 5, scale: 1.05 },
      transition: { duration: 0.2 }
    };
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-orange-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div 
                {...getLogoProps()}
                className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center"
              >
                <SafeIcon icon={FiIcons.FiCoffee} className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text-stable leading-none">
                  Meal Plan
                </span>
                <span className="text-xs text-gray-500 leading-none">
                  by Super Tasty Recipes
                </span>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className="relative">
                    <motion.div
                      {...(isMobile ? {} : { whileHover: { scale: 1.02 } })}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      <SafeIcon icon={item.icon} className="w-5 h-5" />
                      <span className="font-medium hidden sm:block">{item.label}</span>
                    </motion.div>
                    {!isMobile && isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <motion.button
                  {...getButtonProps()}
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all mobile-static"
                >
                  <SafeIcon icon={FiLogIn} className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;