import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'No user')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          // Handle new user registration
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User signed in:', session.user.email)
            await handleUserSignIn(session.user)
            
            // Clean up URL after OAuth callback
            if (window.location.search.includes('code=') || window.location.search.includes('access_token=')) {
              window.history.replaceState({}, document.title, window.location.pathname + window.location.hash)
            }
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            console.log('🚪 User signed out - clearing data')
            clearLocalData()
            // Force redirect to landing page
            if (window.location.hash !== '#/landing') {
              window.location.hash = '#/landing'
              window.location.reload()
            }
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const clearLocalData = () => {
    try {
      console.log('🧹 Clearing local data...')
      
      // Clear all possible localStorage keys
      const keysToRemove = [
        'mealPlannerRecipes',
        'mealPlannerMealPlans',
        'supabase.auth.token',
        'sb-labsvtcxahdfzeqmnnyz-auth-token',
        'supabase.session',
        'sb-session'
      ]
      
      // Clear localStorage
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn(`Error removing ${key}:`, e)
        }
      })

      // Clear all localStorage items that start with 'sb-'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.warn(`Error removing ${key}:`, e)
          }
        }
      })

      // Clear sessionStorage
      try {
        sessionStorage.clear()
      } catch (e) {
        console.warn('Error clearing sessionStorage:', e)
      }

      console.log('✅ Local data cleared')
    } catch (error) {
      console.error('❌ Error clearing local data:', error)
    }
  }

  const handleUserSignIn = async (user) => {
    try {
      // Check if this is a new user (first sign in)
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles_mp2025')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking user profile:', profileError)
      }

      if (!existingProfile) {
        // Create user profile
        const { error: insertError } = await supabase
          .from('user_profiles_mp2025')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url || null,
              newsletter_subscribed: true,
              created_at: new Date().toISOString()
            }
          ])

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        } else {
          console.log('User profile created successfully')
        }
      }
    } catch (error) {
      console.error('Error handling user sign in:', error)
    }
  }

  // Get the correct redirect URL based on environment
  const getRedirectUrl = () => {
    // Check if we're in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.origin}/#/`
    }
    
    // For production, use the actual domain
    return `${window.location.origin}/#/`
  }

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = getRedirectUrl()
      console.log('🔗 Google OAuth redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { 
        success: false, 
        error: error.message || 'Google authentication failed. Please check your configuration or use email authentication.' 
      }
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Email sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  const signUpWithEmail = async (email, password, fullName = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Email sign up error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    console.log('🚪 Sign out initiated...')
    
    try {
      // Clear local state immediately
      setUser(null)
      setSession(null)
      
      // Clear local data
      clearLocalData()
      
      // Sign out from Supabase (this will trigger the auth state change)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase sign out error:', error)
        // Continue with local sign out even if Supabase fails
      }

      console.log('✅ Sign out process completed')
      
      // Force immediate redirect
      window.location.hash = '#/landing'
      window.location.reload()
      
      return { success: true }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      
      // Force local sign out even on error
      setUser(null)
      setSession(null)
      clearLocalData()
      
      // Still redirect
      window.location.hash = '#/landing'
      window.location.reload()
      
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in')
      }

      const { error } = await supabase
        .from('user_profiles_mp2025')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}