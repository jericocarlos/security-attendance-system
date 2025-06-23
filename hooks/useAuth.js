import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  
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
      
      router.push('/admin/employees-management');
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