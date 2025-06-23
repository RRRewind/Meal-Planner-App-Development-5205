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
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.email)
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          // Handle new user registration
          if (event === 'SIGNED_IN' && session?.user) {
            await handleUserSignIn(session.user)
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing local data')
            clearLocalData()
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
      // Clear all meal planner related localStorage data
      const keysToRemove = [
        'mealPlannerRecipes',
        'mealPlannerMealPlans',
        'supabase.auth.token',
        'sb-labsvtcxahdfzeqmnnyz-auth-token'
      ]
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn(`Error removing ${key} from localStorage:`, e)
        }
      })

      // Clear sessionStorage as well
      try {
        sessionStorage.clear()
      } catch (e) {
        console.warn('Error clearing sessionStorage:', e)
      }

      console.log('✅ Local data cleared successfully')
    } catch (error) {
      console.error('Error clearing local data:', error)
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

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
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
        error: error.message || 'Google authentication is not properly configured. Please use email authentication.' 
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
    try {
      console.log('🔄 Starting sign out process...')
      
      // Clear local data first
      clearLocalData()
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase sign out error:', error)
        throw error
      }

      // Force clear the state immediately
      setUser(null)
      setSession(null)
      
      console.log('✅ Sign out successful')
      
      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/landing'
      }, 100)
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      
      // Even if there's an error, try to clear local state
      setUser(null)
      setSession(null)
      clearLocalData()
      
      // Still redirect to landing page
      setTimeout(() => {
        window.location.href = '/landing'
      }, 100)
      
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