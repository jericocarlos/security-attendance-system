import { signIn } from 'next-auth/react';

export function useAuth() {
  const login = async (credentials) => {
    try {
      const result = await signIn('credentials', {
        identifier: credentials.identifier,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      // No redirect here!
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: "An error occurred. Please try again." 
      };
    }
  };

  return { login };
}