import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider, useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

const AuthContext = createContext();

// Inner provider that uses Clerk hooks
function AuthProviderInner({ children }) {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();
  const clerk = useClerk();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Sync Clerk user with Supabase
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isClerkLoaded || !isSignedIn || !clerkUser) {
        setUserProfile(null);
        return;
      }

      setIsLoadingProfile(true);
      try {
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', clerkUser.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user:', fetchError);
        }

        if (existingUser) {
          setUserProfile(existingUser);
        } else {
          // Create user in Supabase
          const newUser = {
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            avatar_url: clerkUser.imageUrl,
            role: 'user',
            created_at: new Date().toISOString(),
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
          } else {
            setUserProfile(createdUser);
          }
        }
      } catch (err) {
        console.error('Error syncing user:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    syncUserWithSupabase();
  }, [isClerkLoaded, isSignedIn, clerkUser]);


  // Combined user object
  const user = userProfile ? {
    ...userProfile,
    id: userProfile.id,
    clerk_id: clerkUser?.id,
    email: clerkUser?.primaryEmailAddress?.emailAddress || userProfile.email,
    full_name: userProfile.full_name || clerkUser?.fullName,
    avatar_url: userProfile.avatar_url || clerkUser?.imageUrl,
  } : null;

  const logout = async () => {
    await signOut();
    setUserProfile(null);
  };

  const navigateToLogin = () => {
    clerk.openSignIn();
  };

  const value = {
    user,
    clerkUser,
    isAuthenticated: isSignedIn && !!userProfile,
    isLoadingAuth: !isClerkLoaded || isLoadingProfile,
    isLoadingPublicSettings: false,
    authError: null,
    logout,
    navigateToLogin,
    signOut,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Main provider that wraps with ClerkProvider
export function AuthProvider({ children }) {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-gray-600">Missing Clerk publishable key. Please set VITE_CLERK_PUBLISHABLE_KEY.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </ClerkProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;