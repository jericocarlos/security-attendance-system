import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormError } from '@/components/ui/FormError';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AUTH_CONSTANTS } from '@/constants/auth';

// Form validation schema
const formSchema = z.object({
  identifier: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm({ onSubmit, isLoading }) {
  const [formError, setFormError] = useState(null);
  
  // Set up form with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  // Focus identifier field on load
  useEffect(() => {
    const identifierInput = document.getElementById('identifier');
    if (identifierInput) identifierInput.focus();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (data) => {
    setFormError(null);
    const result = await onSubmit(data);
    
    if (result?.error) {
      setFormError(result.error);
      form.setError('root', { 
        type: 'manual',
        message: result.error 
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormError error={formError} />
        
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="identifier">{AUTH_CONSTANTS.LABELS.USERNAME_LABEL}</FormLabel>
              <FormControl>
                <Input
                  id="identifier"
                  placeholder={AUTH_CONSTANTS.LABELS.USERNAME_PLACEHOLDER}
                  autoComplete="username"
                  {...field}
                  aria-required="true"
                  className={form.formState.errors.identifier ? "border-red-300" : ""}
                  data-testid="login-username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <PasswordInput 
              field={field} 
              label={AUTH_CONSTANTS.LABELS.PASSWORD_LABEL}
              placeholder={AUTH_CONSTANTS.LABELS.PASSWORD_PLACEHOLDER}
              error={form.formState.errors.password}
            />
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          data-testid="login-submit"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              {AUTH_CONSTANTS.LABELS.LOADING_TEXT}
            </>
          ) : (
            AUTH_CONSTANTS.LABELS.SUBMIT_BUTTON
          )}
        </Button>
      </form>
    </Form>
  );
}