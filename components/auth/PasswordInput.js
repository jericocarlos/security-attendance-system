import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function PasswordInput({ field, label, placeholder, error }) {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <FormItem>
      <FormLabel htmlFor="password">{label}</FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            autoComplete="current-password"
            {...field}
            aria-required="true"
            className={error ? "border-red-300 pr-10" : "pr-10"}
            data-testid="login-password"
          />
        </FormControl>
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          data-testid="password-toggle"
        >
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <FormMessage />
    </FormItem>
  );
}