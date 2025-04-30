import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { LoginCredentials, SignupCredentials } from '../types';

const Auth: React.FC = () => {
  const { login, signup, error, isLoading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    setFormError(null);
    try {
      await login(credentials);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleSignup = async (credentials: SignupCredentials) => {
    setFormError(null);
    try {
      await signup(credentials);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <MapPin className="w-14 h-14 text-primary-600" />
        </div>
        <h1 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
          Lost & Found
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect lost items with their owners
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoginView ? (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToSignup={() => setIsLoginView(false)}
              isSubmitting={isLoading}
              error={formError || error}
            />
          ) : (
            <SignupForm
              onSubmit={handleSignup}
              onSwitchToLogin={() => setIsLoginView(true)}
              isSubmitting={isLoading}
              error={formError || error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;