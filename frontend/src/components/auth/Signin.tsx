import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../AuthContext';

interface Errors {
  email?: string;
  password?: string;
  name?: string;
}

interface SignInProps {
  switchToLogin: () => void;
}

const SignIn: React.FC<SignInProps> = ({ switchToLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();
  const { user, error: authError } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath =
        user.role === 'admin'
          ? '/components/admin'
          : user.role === 'student'
          ? '/components/student'
          : user.role === 'teacher'
          ? '/components/teacher'
          : '/';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  // Display auth errors from useAuth
  useEffect(() => {
    if (authError) {
      setApiError(authError);
    }
  }, [authError]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: 'student', // Default to student for sign-up
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setEmail('');
        setPassword('');
        setName('');
        setErrors({});
        setSuccessMessage('Registration Successful! Welcome!');
        setTimeout(() => {
          navigate('/components/student', { replace: true });
        }, 1000);
      } catch (error: any) {
        console.error('Sign-up error:', error);
        setApiError(error.response?.data?.message || 'Failed to sign up');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-cyan-500/30 flex items-center space-x-2">
            <span className="text-cyan-400 text-lg font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-red-500/90 backdrop-blur-lg border border-red-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-red-500/30 flex items-center space-x-2">
            <span className="text-white text-lg font-semibold">{apiError}</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 glitch-bg z-0" />
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 z-10">
        <div className="flex-1 min-w-0 p-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8 animate-pulse">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${
                  errors.name ? 'border-pink-500' : ''
                }`}
                placeholder="Name"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${
                  name ? '-top-6 text-sm text-cyan-200' : ''
                }`}
              >
                Name
              </label>
              {errors.name && <span className="text-pink-500 text-sm text-center block">{errors.name}</span>}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${
                  errors.email ? 'border-pink-500' : ''
                }`}
                placeholder="Email"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${
                  email ? '-top-6 text-sm text-cyan-200' : ''
                }`}
              >
                Email
              </label>
              {errors.email && <span className="text-pink-500 text-sm text-center block">{errors.email}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${
                  errors.password ? 'border-pink-500' : ''
                }`}
                placeholder="Password"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${
                  password ? '-top-6 text-sm text-cyan-200' : ''
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-cyan-300/70 hover:text-cyan-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
              </button>
              {errors.password && <span className="text-pink-500 text-sm text-center block">{errors.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 animate-pulse disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <p className="text-center text-sm text-cyan-300/80 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-pink-400 hover:underline hover:text-pink-300"
                disabled={isLoading}
              >
                Log In
              </button>
            </p>
          </form>
        </div>
        <div className="flex-1 min-w-0 bg-gradient-to-br from-cyan-900 to-pink-900 flex items-center justify-center p-8">
          <div className="text-center text-white/80">
            <h3 className="text-2xl font-semibold mb-2">Join Us</h3>
            <p>Create your account to get started.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

interface SignInProps {
  switchToLogin: () => void;
}

const SignIn: React.FC<SignInProps> = ({ switchToLogin }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) newErrors.email = 'Invalid email address';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        const signinUrl = '/api/signin'; // Use proxy
        console.log('Sending signup request to:', signinUrl);
        await axios.post(signinUrl, { name, email, password });
        setName('');
        setEmail('');
        setPassword('');
        setErrors({});
        setSuccessMessage('Sign Up Successful! Please log in.');
        setTimeout(switchToLogin, 3000); // Switch to login after 3s
      } catch (error: any) {
        console.error('Sign up error:', error);
        setApiError(
          error.code === 'ERR_NETWORK' && error.message.includes('Cross-Origin')
            ? 'CORS error: Cannot connect to server. Check backend configuration.'
            : error.response?.data?.message || 'Failed to sign up'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Success Message Toast }
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-lg border border-pink-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-pink-500/30 flex items-center space-x-2">
            <span className="text-pink-400 text-lg font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 glitch-bg z-0" />
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#1a1a2e]/90 backdrop-blur-lg border border-pink-500/30 shadow-2xl shadow-pink-500/20 z-10">
        <div className="flex-1 min-w-0 p-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold text-pink-400 text-center mb-8 animate-pulse">Sign Up</h2>
          {apiError && <p className="text-cyan-500 text-center mb-6">{apiError}</p>}
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-pink-500/50 text-white focus:outline-none focus:border-pink-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.name ? 'border-cyan-500' : ''}`}
                placeholder="Name"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-pink-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-pink-200 ${name ? '-top-6 text-sm text-pink-200' : ''}`}
              >
                Name
              </label>
              {errors.name && <span className="text-cyan-500 text-sm text-center block">{errors.name}</span>}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-pink-500/50 text-white focus:outline-none focus:border-pink-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.email ? 'border-cyan-500' : ''}`}
                placeholder="Email"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-pink-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-pink-200 ${email ? '-top-6 text-sm text-pink-200' : ''}`}
              >
                Email
              </label>
              {errors.email && <span className="text-cyan-500 text-sm text-center block">{errors.email}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 bg-transparent border-2 border-pink-500/50 text-white focus:outline-none focus:border-pink-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.password ? 'border-cyan-500' : ''}`}
                placeholder="Password"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-pink-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-pink-200 ${password ? '-top-6 text-sm text-pink-200' : ''}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-pink-300/70 hover:text-pink-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
              </button>
              {errors.password && <span className="text-cyan-500 text-sm text-center block">{errors.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50 animate-pulse disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <p className="text-center text-sm text-pink-300/80 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-cyan-400 hover:underline hover:text-cyan-300"
                disabled={isLoading}
              >
                Log In
              </button>
            </p>
          </form>
        </div>
        <div className="flex-1 min-w-0 bg-gradient-to-br from-pink-900 to-cyan-900 flex items-center justify-center p-8">
          <div className="text-center text-white/80">
            <h3 className="text-2xl font-semibold mb-2">Join Us</h3>
            <p>Create your account in seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;*/