import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useAuth } from '../context/AuthContext'

const { FiUser, FiSettings, FiLogOut, FiChevronDown } = FiIcons

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  const userInitials = user.user_metadata?.full_name 
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email.charAt(0).toUpperCase()

  const displayName = user.user_metadata?.full_name || user.email.split('@')[0]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white rounded-xl px-3 py-2 shadow-md border border-orange-100 hover:bg-orange-50 transition-colors"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {userInitials}
          </div>
        )}
        <span className="hidden sm:block font-medium text-gray-700 max-w-20 truncate">
          {displayName}
        </span>
        <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-500" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20"
            >
              {/* User Info */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {userInitials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Open profile modal
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Profile Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Open preferences modal
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiSettings} className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Preferences</span>
                </button>

                <hr className="my-2 border-gray-100" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600"
                >
                  <SafeIcon icon={FiLogOut} className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu