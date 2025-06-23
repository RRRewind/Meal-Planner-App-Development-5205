import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { kitAPI } from '../lib/kit'

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle new user registration
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSignIn(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleUserSignIn = async (user) => {
    try {
      // Check if this is a new user (first sign in)
      const { data: existingProfile } = await supabase
        .from('user_profiles_mp2025')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles_mp2025')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url || null,
              newsletter_subscribed: true, // Default to subscribed
              created_at: new Date().toISOString()
            }
          ])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        } else {
          // Subscribe to newsletter
          await subscribeToNewsletter(user)
        }
      }
    } catch (error) {
      console.error('Error handling user sign in:', error)
    }
  }

  const subscribeToNewsletter = async (user) => {
    try {
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || ''
      const lastName = user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''

      const result = await kitAPI.subscribeToNewsletter(
        user.email,
        firstName,
        lastName,
        ['meal-planner-app', 'new-user']
      )

      if (result.success) {
        console.log('Successfully subscribed to newsletter')
        // Update user profile with newsletter subscription status
        await supabase
          .from('user_profiles_mp2025')
          .update({ 
            newsletter_subscribed: true,
            kit_subscriber_id: result.data?.subscription?.id
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/dashboard`,
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
      return { success: false, error: error.message }
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local storage
      localStorage.removeItem('mealPlannerRecipes')
      localStorage.removeItem('mealPlannerMealPlans')

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    try {
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

  const updateNewsletterSubscription = async (subscribed) => {
    try {
      if (subscribed && !user.newsletter_subscribed) {
        // Subscribe to newsletter
        await subscribeToNewsletter(user)
      }

      const { error } = await supabase
        .from('user_profiles_mp2025')
        .update({ newsletter_subscribed: subscribed })
        .eq('id', user.id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Newsletter subscription update error:', error)
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
    updateProfile,
    updateNewsletterSubscription
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}