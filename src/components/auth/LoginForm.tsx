import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { LoginCredentials } from '../../types';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onSwitchToSignup: () => void;
  isSubmitting: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  onSwitchToSignup, 
  isSubmitting, 
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await onSubmit({ email, password });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-gray-600">Sign in to your account</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={formErrors.email}
          required
        />
        
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={formErrors.password}
          required
        />
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
        >
          {!isSubmitting && <LogIn className="w-4 h-4 mr-2" />}
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-700 font-medium"
            onClick={onSwitchToSignup}
          >
            Sign up
          </button>
        </p>
      </div>
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="text-center">
          <p className="text-xs text-gray-500">For demo purposes:</p>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <p>User: <span className="font-mono">john@example.com</span></p>
            <p>Admin: <span className="font-mono">admin@example.com</span></p>
            <p className="italic">(Any password will work)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;